#!/usr/bin/env python3
"""
build_assets.py - regenerate every image the site derives from the painting.

    pip install numpy opencv-contrib-python-headless pillow
    python3 tools/retouch.py tools/source/painting-original.jpg tools/source/painting-master.png
    python3 tools/build_assets.py tools/source/painting-master.png

Outputs (all under assets/):
  painting/painting-{800,1280,1920,2576}.webp   the painting at four widths
  painting/painting-1280.jpg                     fallback for browsers without WebP
  painting/flow.png      R,G = direction the paint drifts (along its brushstrokes), B = how far it may drift
  painting/height.webp   relief of the impasto (band-passed luminance) for the raking light
  painting/meta.json     flower positions, doorways, phone-safe framing, tiny blurred preview (also meta.js)
  img/flower-<room>.webp each doorway flower cut out with a soft round edge (used in its room); -160.webp thumbnail for footers and notes
  img/og-image.jpg       1200 x 630 social preview

Coordinates below are pixels in the 2576 x 1438 painting. If the painting changes, re-measure FLOWERS,
VASE and the doorway list, then rerun.
"""
import sys, json, base64, io, pathlib
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_P = ROOT / "assets" / "painting"
OUT_I = ROOT / "assets" / "img"

# id, centre x, centre y, radius (head incl. petals), kind
FLOWERS = [
    ("models",    1386, 158, 122, "seedhead"),   # A - the crown, tallest head
    ("b",         1114, 266, 118, "seedhead"),
    ("c",         1203, 400, 100, "seedhead"),
    ("analytics",  905, 416, 150, "bloom"),      # D - dark-eyed bloom, left
    ("finance",   1354, 479, 148, "bloom"),      # E - golden bloom at the centre
    ("f",         1540, 390, 115, "wilting"),
    ("marketing", 1760, 455, 105, "turning"),    # G - head turned to one side
    ("h",         2100, 400, 120, "turning"),
    ("i",          430, 670, 130, "turning"),
    ("j",          775, 840, 110, "bloom"),
    ("contact",   1267, 787, 128, "seedhead"),   # K - big seed head held by the vase
    ("l",         1430, 750,  95, "seedhead"),
    ("learn",     1626, 668, 110, "bloom"),      # M - open bloom right of the vase
    ("n",         1930, 769, 120, "bloom"),
    ("o",         2210, 677, 115, "turning"),
    ("p",          960, 1000, 70, "bud"),
    ("q",         1580, 960,  90, "wilting"),
    ("r",         1250, 925,  75, "seedhead"),
]
DOORWAYS = ["finance", "analytics", "marketing", "models", "contact", "learn"]
VASE = [(1100, 1020), (1500, 1020), (1505, 1120), (1480, 1260), (1440, 1370), (1170, 1375), (1125, 1270), (1098, 1130)]
FRAME = 95          # painted frame border (px) - never moves
TABLE_Y = 1130      # back edge of the table
CENTRE = (1330, 560)  # heart of the bouquet: the background paint circles it


def orientation_field(img, sigma_g=1.0, sigma_t=5.0):
    """Along-stroke angle and coherence from a colour structure tensor."""
    f = cv2.GaussianBlur(img, (0, 0), sigma_g)
    Jxx = np.zeros(img.shape[:2], np.float32); Jxy = Jxx.copy(); Jyy = Jxx.copy()
    for c in range(3):
        gx = cv2.Scharr(f[..., c], cv2.CV_32F, 1, 0) / 32.0
        gy = cv2.Scharr(f[..., c], cv2.CV_32F, 0, 1) / 32.0
        Jxx += gx * gx; Jxy += gx * gy; Jyy += gy * gy
    Jxx = cv2.GaussianBlur(Jxx, (0, 0), sigma_t); Jxy = cv2.GaussianBlur(Jxy, (0, 0), sigma_t); Jyy = cv2.GaussianBlur(Jyy, (0, 0), sigma_t)
    theta = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)
    phi = theta + np.pi / 2
    tr = Jxx + Jyy; det = np.sqrt(((Jxx - Jyy) / 2) ** 2 + Jxy ** 2)
    l1 = tr / 2 + det; l2 = tr / 2 - det
    coh = ((l1 - l2) / (l1 + l2 + 1e-8)) ** 2
    return phi.astype(np.float32), coh.astype(np.float32)


def main(master_path):
    OUT_P.mkdir(parents=True, exist_ok=True); OUT_I.mkdir(parents=True, exist_ok=True)
    pil = Image.open(master_path).convert("RGB")
    W, H = pil.size
    assert (W, H) == (2576, 1438), (W, H)

    # 1. the painting at four widths -------------------------------------------------------
    for w in (800, 1280, 1920, 2576):
        im = pil if w == W else pil.resize((w, round(H * w / W)), Image.LANCZOS)
        im.save(OUT_P / f"painting-{w}.webp", "WEBP", quality=82 if w < 2576 else 80, method=6)
    pil.resize((1280, round(H * 1280 / W)), Image.LANCZOS).save(OUT_P / "painting-1280.jpg", "JPEG", quality=82, optimize=True, progressive=True)

    # tiny blurred preview, inlined in the page so something warm shows instantly
    tiny = pil.resize((40, 22), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    buf = io.BytesIO(); tiny.save(buf, "JPEG", quality=55)
    lqip = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

    # 2. flow map (half-res analysis, quarter-res output) ---------------------------------------
    hw, hh = W // 2, H // 2
    half = np.asarray(pil.resize((hw, hh), Image.LANCZOS)).astype(np.float32) / 255.0
    phi, coh = orientation_field(half)
    yy, xx = np.mgrid[0:hh, 0:hw].astype(np.float32)
    X, Y = xx * 2, yy * 2                                    # back to full-res coordinates
    cx, cy = CENTRE
    rx, ry = X - cx, Y - cy
    rl = np.sqrt(rx ** 2 + ry ** 2) + 1e-3
    tx, ty = -ry / rl, rx / rl                               # tangent: paint circles the bouquet
    gx, gy = 0.86 * tx + 0.34 * rx / rl, 0.86 * ty + 0.34 * ry / rl   # ...drifting slightly outward
    table = Y > TABLE_Y
    gx = np.where(table, 1.0, gx); gy = np.where(table, 0.0, gy)     # the table's strokes run sideways
    dx, dy = np.cos(phi), np.sin(phi)
    flip = (dx * gx + dy * gy) < 0
    dx = np.where(flip, -dx, dx); dy = np.where(flip, -dy, dy)
    w = np.clip(coh * 1.6, 0, 1)
    vx = w * dx + (1 - w) * gx * 0.6
    vy = w * dy + (1 - w) * gy * 0.6
    vx = cv2.GaussianBlur(vx, (0, 0), 2.2); vy = cv2.GaussianBlur(vy, (0, 0), 2.2)
    mag = np.sqrt(vx ** 2 + vy ** 2) + 1e-6
    ux, uy = vx / mag, vy / mag

    speed = np.ones((hh, hw), np.float32)
    # flowers keep their shape (they sway in the shader instead of flowing)
    for _id, fx, fy, fr, _k in FLOWERS:
        d = np.sqrt((X - fx) ** 2 + (Y - fy) ** 2) / fr
        speed = np.minimum(speed, np.clip((d - 0.85) / 0.45, 0.14, 1.0))
    speed = np.where(table, speed * 0.55, speed)
    vase = np.zeros((hh, hw), np.uint8)
    cv2.fillPoly(vase, [np.array([(x // 2, y // 2) for x, y in VASE], np.int32)], 1)
    vase = cv2.dilate(vase, np.ones((7, 7), np.uint8))
    speed = np.where(vase > 0, 0.0, speed)
    edge = np.minimum(np.minimum(X, W - X), np.minimum(Y, H - Y))
    speed *= np.clip((edge - FRAME) / 40.0, 0, 1)           # the painted frame never moves
    speed *= np.clip(mag / 0.55, 0.25, 1.0)                  # where strokes disagree, drift less
    speed = cv2.GaussianBlur(speed, (0, 0), 1.5)

    q = lambda a: cv2.resize(a, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    rgb = np.dstack([
        np.clip(128 + 127 * q(ux), 0, 255),
        np.clip(128 + 127 * q(uy), 0, 255),
        np.clip(255 * q(speed), 0, 255),
    ]).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(OUT_P / "flow.png", optimize=True)

    # 3. impasto relief for the raking light -------------------------------------------------
    lum = 0.299 * half[..., 0] + 0.587 * half[..., 1] + 0.114 * half[..., 2]
    band = cv2.GaussianBlur(lum, (0, 0), 0.8) - cv2.GaussianBlur(lum, (0, 0), 7.0)
    lo, hi = np.percentile(band, [1, 99])
    height = np.clip((band - lo) / (hi - lo), 0, 1)
    Image.fromarray((height * 255).astype(np.uint8), "L").save(OUT_P / "height.webp", "WEBP", quality=80, method=6)

    # 4. doorway flowers, cut out for their rooms ---------------------------------------------
    for fid, fx, fy, fr, kind in FLOWERS:
        if fid not in DOORWAYS:
            continue
        S = int(fr * 2.45)
        box = (fx - S // 2, fy - S // 2, fx + S // 2, fy + S // 2)
        crop = pil.crop(box).resize((720, 720), Image.LANCZOS)
        mask = Image.new("L", (720, 720), 0)
        ImageDraw.Draw(mask).ellipse((18, 18, 702, 702), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(14))
        crop.putalpha(mask)
        crop.save(OUT_I / f"flower-{fid}.webp", "WEBP", quality=84, method=6)
        crop.resize((160, 160), Image.LANCZOS).save(OUT_I / f"flower-{fid}-160.webp", "WEBP", quality=82, method=6)  # footers, notes

    # 5. social preview ----------------------------------------------------------------------------
    og = pil.resize((1200, round(H * 1200 / W)), Image.LANCZOS)
    top = (og.size[1] - 630) // 2
    og.crop((0, top, 1200, top + 630)).save(OUT_I / "og-image.jpg", "JPEG", quality=84, optimize=True, progressive=True)

    # 6. meta for the shader and the page ---------------------------------------------------------
    door = {f[0]: f for f in FLOWERS if f[0] in DOORWAYS}
    xs = [door[d][1] - door[d][3] for d in DOORWAYS] + [door[d][1] + door[d][3] for d in DOORWAYS]
    ys = [door[d][2] - door[d][3] for d in DOORWAYS] + [door[d][2] + door[d][3] for d in DOORWAYS]
    safe = [max(0, min(xs) - 70), max(0, min(ys) - 30), min(W, max(xs) + 70), min(H, max(ys) + 70)]
    meta = {
        "width": W, "height": H,
        "flowers": [{"id": f[0], "x": f[1], "y": f[2], "r": f[3], "kind": f[4]} for f in FLOWERS],
        "doorways": DOORWAYS,
        "safe": {"x": safe[0], "y": safe[1], "w": safe[2] - safe[0], "h": safe[3] - safe[1]},
        "lqip": lqip,
    }
    (OUT_P / "meta.json").write_text(json.dumps(meta, indent=1))
    # the same data as an ES module, so the homepage needs no extra request for it
    (OUT_P / "meta.js").write_text("// generated by tools/build_assets.py - do not edit by hand\nexport default " + json.dumps(meta) + ";\n")
    # keep the homepage's first-paint framing script in step with the safe rectangle
    idx = ROOT / "index.html"
    if idx.exists():
        html = idx.read_text()
        sx, sy, sw, sh = meta["safe"]["x"], meta["safe"]["y"], meta["safe"]["w"], meta["safe"]["h"]
        import re
        html2 = re.sub(r"var W=\d+,H=\d+,S=\{x:\d+,y:\d+,w:\d+,h:\d+\}", f"var W={W},H={H},S={{x:{sx},y:{sy},w:{sw},h:{sh}}}", html)
        if html2 != html:
            idx.write_text(html2); print("index.html first-paint framing updated")
    for p in sorted(list(OUT_P.iterdir()) + list(OUT_I.iterdir())):
        print(f"{p.relative_to(ROOT)}  {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "tools" / "source" / "painting-master.png"))
