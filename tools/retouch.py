#!/usr/bin/env python3
"""Retouch two generation artifacts in the source painting:
1. The duplicated "Vincent" signature on the upper (golden) part of the vase.
   Van Gogh signed once, on the pale band; the upper copy is removed.
2. A pale blue-grey ring around one flower's centre (right of the bouquet),
   recoloured into the brown/ochre of the neighbouring seed discs.
Usage: python3 retouch.py source.jpg out.png [debug_dir]
"""
import sys, numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
dbg = sys.argv[3] if len(sys.argv) > 3 else None
im = cv2.imread(src, cv2.IMREAD_COLOR)            # BGR uint8
H, W = im.shape[:2]
f = im.astype(np.float32)
B, G, R = f[..., 0], f[..., 1], f[..., 2]

# ---- 1. upper signature -------------------------------------------------
x0, y0, x1, y1 = 1117, 1045, 1240, 1160          # box around the upper "Vincent" (right of the vase outline)
box = np.zeros((H, W), np.uint8); box[y0:y1, x0:x1] = 1
lum0 = 0.299 * R + 0.587 * G + 0.114 * B
ink = (lum0 < 92) & (box > 0)                     # the lettering is near-black umber on golden ochre
yy, xx = np.mgrid[0:H, 0:W]
outline_x = 1108 + (yy - 1045) * 0.12             # the vase's own dark contour stays untouched
ink &= xx > outline_x + 7
band_edge = 1128 + (xx - 1105) * 0.30             # the pale band (and the real signature) start below this line
ink &= yy < band_edge - 2
m = ink.astype(np.uint8) * 255
m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
m[(yy > band_edge) | (xx < outline_x + 4)] = 0
P = 40
crop = im[y0-P:y1+P, x0-P:x1+P].copy()
mcrop = m[y0-P:y1+P, x0-P:x1+P].copy()
res = np.zeros_like(crop)
cv2.xphoto.inpaint(crop, 255 - mcrop, res, cv2.xphoto.INPAINT_FSR_BEST)   # xphoto mask: 0 = missing
# FSR leaves a smooth fill; lend it brush texture (high-pass only) from clean ochre paint on the
# right side of the vase, so the patch keeps the impasto grain of its surroundings.
dx = 248
srcp = im[y0-P:y1+P, x0-P+dx:x1+P+dx].astype(np.float32)
detail = srcp - cv2.GaussianBlur(srcp, (0, 0), 3.0)
feather = cv2.GaussianBlur((mcrop > 0).astype(np.float32), (0, 0), 2.5)[..., None]
res = (res.astype(np.float32) + detail * 0.9 * feather).clip(0, 255).astype(np.uint8)
im[y0-P:y1+P, x0-P:x1+P] = res
if dbg: cv2.imwrite(f"{dbg}/sig_mask.png", mcrop)

# ---- 2. blue-grey ring ----------------------------------------------------
cx, cy, ax, ay = 1626, 668, 52, 74               # ellipse around the ring
ell = np.zeros((H, W), np.uint8)
cv2.ellipse(ell, (cx, cy), (ax, ay), 8, 0, 360, 255, -1)
f = im.astype(np.float32); B, G, R = f[..., 0], f[..., 1], f[..., 2]
mx = np.maximum(np.maximum(R, G), B); mn = np.minimum(np.minimum(R, G), B)
sat = (mx - mn) / (mx + 1e-3)
lum1 = (0.299 * R + 0.587 * G + 0.114 * B) / 255.0
greyblue = (sat < 0.46) & (lum1 > 0.40) & (ell > 0)     # pale grey/blue paint; petals are far more saturated
gm = cv2.GaussianBlur(greyblue.astype(np.float32), (0, 0), 1.6)
lum = (0.299 * R + 0.587 * G + 0.114 * B) / 255.0
# map luminance to a seed-disc ramp: deep umber -> warm ochre
dark = np.array([20, 48, 92], np.float32)        # BGR umber
mid = np.array([30, 92, 160], np.float32)        # BGR ochre-brown
light = np.array([52, 128, 186], np.float32)     # BGR muted golden highlight
t = np.clip((lum - 0.35) / 0.6, 0, 1)[..., None]
ramp = np.where(t < 0.5, dark + (mid - dark) * (t / 0.5), mid + (light - mid) * ((t - 0.5) / 0.5))
im = (f * (1 - gm[..., None]) + ramp * gm[..., None]).clip(0, 255).astype(np.uint8)
if dbg: cv2.imwrite(f"{dbg}/ring_mask.png", (gm * 255).astype(np.uint8)[cy-100:cy+100, cx-80:cx+80])

cv2.imwrite(out, im)
print("wrote", out)
