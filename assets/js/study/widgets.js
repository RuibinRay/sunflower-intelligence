// widgets.js — mounts a lesson's interactives. Each `.widget[data-widget]` placeholder names a widget in the
// lesson's .ex.js `widgets`; its `type` picks the module in ./widgets/<type>.js, which exports mount(el, config, ctx).
// Widgets load when they come near the viewport, so a long lesson doesn't pay for interactives it hasn't reached.
import { h } from '../core/dom.js?v=14';
import { whenNear } from '../core/ui.js?v=14';
import { syncRanges } from '../core/site.js?v=14';

export function mountWidgets(scope, configs, { report } = {}) {
  scope.querySelectorAll('.widget[data-widget]').forEach((el) => {
    const id = el.dataset.widget;
    const cfg = configs?.[id];
    if (!cfg || !/^[a-z][a-z-]*$/.test(cfg.type || '')) {
      el.replaceChildren(h('p', { class: 'note' }, 'This interactive isn’t available yet.'));
      return;
    }
    whenNear(el, async () => {
      try {
        const mod = await import(`./widgets/${cfg.type}.js?v=14`);
        el.replaceChildren();
        await mod.mount(el, cfg, { id, report: (event, detail) => report?.(id, event, detail) });
        syncRanges(el);
      } catch (e) {
        console.error(`widget ${id} (${cfg.type})`, e);
        el.classList.add('is-error');
        el.replaceChildren(h('p', { class: 'note' }, 'This interactive didn’t load. Reload the page to try again; the rest of the lesson works without it.'));
      }
    });
  });
}
