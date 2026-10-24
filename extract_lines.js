// Extracts every spoken line from the running game into lines.json (for make_voices.py).
// Finds speakers from SPK at runtime, and scans every script listed in index.html for ['speaker','text'] pairs.
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:' + (process.env.PORT || 8765) + '/index.html'); await p.waitForTimeout(600);
  if (errs.length) console.log('PAGE ERRORS', errs);
  const speakers = await p.evaluate(() => Object.keys(SPK));
  const files = [...fs.readFileSync('index.html', 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(f => fs.existsSync(f));
  const src = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const re = new RegExp(`\\[\\s*['"](${speakers.join('|')})['"]\\s*,\\s*(['"])((?:\\\\.|(?!\\2).)*)\\2\\s*\\]`, 'g');
  const pairs = [...src.matchAll(re)].map(m => [m[1], m[3].replace(/\\(['"])/g, '$1')]);
  const lines = await p.evaluate((pairs) => {
    const out = []; const add = (w, t) => { if (typeof t === 'string' && t.trim()) out.push([w, t]); };
    pairs.forEach(([w, t]) => add(w, t));
    Q.forEach(q => { add('narrator', q.text); if (q.hint) add('grandma', q.hint); (q.start || []).forEach(l => { if (Array.isArray(l)) add(l[0], l[1]); }); });
    CHEERS.forEach(t => add('grandma', t)); UNI_LINES.forEach(t => add('stardust', t));
    STARS.forEach(s => add('narrator', msgStar(s)));
    Object.values(CROPS).forEach(c => add('narrator', c.name + ' seeds'));
    DECOR.forEach(d => { add('hops', msgBought(d)); add('hops', msgOwned(d)); add('hops', msgCost(d)); add('hops', msgItem(d)); });
    SIGNS.forEach(s => add('narrator', s.text)); add('narrator', GROWING); add('narrator', COINS_SAY);
    Object.values(ITEM_NAMES).forEach(n => add('narrator', n)); add('hops', SELL_SAY); add('hops', BASKET_EMPTY);
    document.querySelectorAll('[data-say]').forEach(el => add(el.dataset.who || 'narrator', el.dataset.say));
    extraLines().forEach(([w, t]) => add(w, t));
    add('hops', SHOP_HELLO); add('hops', SHOP_THANKS); add('buttercup', 'Giddy up!'); add('narrator', 'Voice is on!'); add('narrator', GREAT_JOB);
    const seen = {}; const res = [];
    for (const [w0, t] of out) { const w = SPK[w0] ? w0 : 'narrator'; const k = voiceKey(t, w); if (seen[k]) continue; seen[k] = 1; res.push({ key: k, who: w, text: voiceText(t) }); }
    return res;
  }, pairs);
  fs.writeFileSync('lines.json', JSON.stringify(lines, null, 1));
  const unknown = [...new Set(lines.map(l => l.who))];
  console.log('lines:', lines.length, 'pairs from source:', pairs.length, 'speakers used:', unknown.join(','));
  await b.close();
})();
