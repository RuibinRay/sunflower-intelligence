// pages-arcade.mjs — the Pixel Arcade's pages: the hub (learn/arcade/) and one page per game. The games
// themselves are scripts in assets/js/arcade/; these pages are the frame they are mounted in.
import { esc, catalog } from './lib.mjs';
import { head, open, close, roomCanvas, breadcrumb } from './shell.mjs';

const card = (g) => `<li class="game-card" data-game="${g.id}"><a href="${g.id}/"><span class="game-art" data-art="${g.id}" aria-hidden="true"></span><span class="game-lang">${esc(g.lang)}</span><span class="game-name">${esc(g.name)}</span><span class="game-blurb">${esc(g.blurb)}</span><span class="game-progress" data-progress="${g.id}">${g.levels ? `${g.levels} levels` : 'Endless'}</span></a></li>`;

export function arcadePage() {
  const root = '../../';
  const learn = catalog.ARCADE.filter((g) => g.kind === 'learn'), loop = catalog.ARCADE.filter((g) => g.kind === 'loop');
  const desc = 'Free pixel games that teach Python, pandas, SQL, spreadsheet formulas, HTML, CSS and JavaScript from the very beginning: eight games with levels that explain one idea each and check you understood it, and two endless games with new questions every run.';
  return `${head({ title: 'Arcade · Learn', desc, path: 'learn/arcade/', root, css: ['arcade'] })}${open({ root, bodyClass: 'page--arcade', skip: 'Skip to the games' })}
    ${roomCanvas({ root, title: 'Arcade', note: 'Pixel games for the languages analysts write. Learn an idea in a level, then keep it sharp in an endless run.' })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Arcade']])}
      <div class="arcade arcade--hub" id="arcade-hub">
        <div class="arc-hero">
          <div>
            <h2 data-px="4">Pixel Arcade</h2>
            <p>New to code? Start with Data Diner, or with Cell Craft if you would rather not code yet. Each of the eight learning games opens by saying what the language is, teaches one idea per level, runs your real code, and ends the level with what you just learned and a quick check. The two endless games keep it fresh with questions made new each run.</p>
          </div>
          <canvas id="arc-mascot" width="32" height="24" aria-hidden="true"></canvas>
        </div>
        <div class="player" id="arc-player" aria-live="polite">
          <div class="player-card"><h3>Rank</h3><p class="player-big">Lv 1 Seed</p><p class="player-sub">Play a level to earn XP.</p></div>
        </div>
        <div class="arc-section"><h3 data-px="2">Learn by playing</h3><p>One idea per level, explained first and checked after. Your code is really run.</p></div>
        <ul class="game-cards" role="list">${learn.map(card).join('')}</ul>
        <div class="arc-section"><h3 data-px="2">Endless games</h3><p>New questions every run. Beat your best score.</p></div>
        <ul class="game-cards" role="list">${loop.map(card).join('')}</ul>
        <div class="arc-section"><h3 data-px="2">Badges</h3><p id="arc-badge-count"></p></div>
        <ul class="badges" id="arc-badges" role="list"></ul>
        <p class="arc-foot">Your XP, stars and scores are kept in this browser only. Nothing is sent anywhere. <button type="button" id="arc-reset">Reset arcade progress</button></p>
        <noscript><p>The games need JavaScript to run.</p></noscript>
      </div>
      <div class="ledger-intro"><p>The arcade goes with the <a href="${root}learn/analytics/">Business Analytics school</a>. Its games use Lantern Coffee, the fictional shop from the courses, and every table and order in them is made up. The small Python, pandas, SQL and CSS readers that run here cover the parts the levels teach; they are not the full languages. Cell Craft uses the same spreadsheet engine as the Excel lessons, and Script Lab runs your JavaScript for real, in a separate thread that cannot touch the page.</p></div>
    </div>${close({ root, script: 'arcade-hub' })}`;
}

export function arcadeGamePage(g) {
  const root = '../../../';
  return `${head({ title: `${g.name} · Arcade · Learn`, desc: g.blurb, path: `learn/arcade/${g.id}/`, root, css: ['arcade'] })}${open({ root, bodyClass: 'page--arcade page--arcade-game', skip: 'Skip to the game' })}
    ${roomCanvas({ root, title: g.name, kicker: `Arcade · ${esc(g.lang)}`, note: esc(g.blurb) })}

    <div class="ledger" id="ledger">
      ${breadcrumb([['The painting', root], ['Learn', `${root}learn/`], ['Arcade', `${root}learn/arcade/`], [g.name]])}
      <div class="arcade" id="arcade" data-game="${g.id}">
        <noscript><p>${esc(g.name)} needs JavaScript to run.</p></noscript>
      </div>
    </div>${close({ root, script: 'arcade-game' })}`;
}
