// Extracts every spoken line from the game (run with node; writes lines.json)
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage();
  await p.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/index.html');
  const src = ['quests.js', 'game.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const pairs = [...src.matchAll(/\[\s*['"](grandma|hops|buttercup|stardust|narrator)['"]\s*,\s*(['"])((?:(?!\2).)*)\2\s*\]/g)].map(m => [m[1], m[3]]);
  const lines = await p.evaluate((pairs) => {
    const out = []; const add = (w, t) => out.push([w, t]);
    pairs.forEach(([w, t]) => add(w, t));
    Q.forEach(q => { add('narrator', q.text); if (q.hint) add('grandma', q.hint); (q.start || []).forEach(([w, t]) => add(w, t)); });
    CHEERS.forEach(t => add('grandma', t)); UNI_LINES.forEach(t => add('stardust', t));
    STARS.forEach(s => add('narrator', msgStar(s)));
    Object.values(CROPS).forEach(c => add('narrator', c.name + ' seeds'));
    DECOR.forEach(d => { add('hops', msgBought(d)); add('hops', msgOwned(d)); add('hops', msgCost(d)); });
    SIGNS.forEach(s => add('narrator', s.text)); add('narrator', GROWING); add('narrator', COINS_SAY);
    Object.values(ITEM_NAMES).forEach(n => add('narrator', n)); add('hops', SELL_SAY); add('hops', BASKET_EMPTY);
    DECOR.forEach(d => add('hops', msgItem(d)));
    document.querySelectorAll('[data-say]').forEach(el => add(el.dataset.who || 'narrator', el.dataset.say));
    add('hops', SHOP_HELLO); add('hops', SHOP_THANKS); add('buttercup', 'Giddy up!'); add('narrator', 'Voice is on!'); add('narrator', GREAT_JOB);
    const seen = {}; const res = [];
    for (const [w, t] of out) { const k = voiceKey(t, w); if (seen[k]) continue; seen[k] = 1; res.push({ key: k, who: w, text: voiceText(t) }); }
    return res;
  }, pairs);
  fs.writeFileSync('lines.json', JSON.stringify(lines, null, 1));
  console.log('lines:', lines.length, 'pairs from source:', pairs.length);
  await b.close();
})();
