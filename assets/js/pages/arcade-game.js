// arcade-game.js — one arcade game page: loads the game named by data-game and mounts it.
import { initSite } from '../core/site.js?v=32';

initSite();
const mount = document.getElementById('arcade');
const root = document.body.dataset.root || '../../../';
const games = { pyquest: 'pyquest', sqlquest: 'sqlquest', tagbuilder: 'tagbuilder', arena: 'arena', catcher: 'catcher' };
const file = games[mount.dataset.game];
if (file) {
  import(`../arcade/${file}.js?v=32`).then((m) => m.start(mount, { root })).catch((e) => {
    mount.append(Object.assign(document.createElement('p'), { textContent: 'The game could not start. Reload the page to try again.' }));
    console.error(e);
  });
}
