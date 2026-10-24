"""Generates natural-sounding voice recordings for every line in lines.json (Microsoft neural voices via edge-tts).
Also saves when each word is spoken, so the game can light up words as they are read."""
import asyncio, json, os, edge_tts
VOICES = {
    'narrator':  ('en-US-AvaNeural',     '-5%',  '+0Hz'),
    'grandma':   ('en-GB-SoniaNeural',   '-10%', '-4Hz'),
    'hops':      ('en-US-RogerNeural',   '+0%',  '+12Hz'),
    'buttercup': ('en-GB-MaisieNeural',  '-5%',  '+0Hz'),
    'stardust':  ('en-US-AnaNeural',     '-5%',  '+0Hz'),
    'cloudberry':('en-US-EmmaNeural',    '-5%',  '+2Hz'),
    'twinkle':   ('en-US-AnaNeural',     '-14%', '+14Hz'),
    'peaches':   ('en-AU-NatashaNeural', '+5%',  '+18Hz'),
    'puff':      ('en-GB-MaisieNeural',  '+4%',  '+22Hz'),
}
lines = json.load(open('lines.json', encoding='utf-8'))
os.makedirs('audio', exist_ok=True)
try: old = json.load(open('audio/manifest.json', encoding='utf-8'))
except Exception: old = {}
manifest = {}
sem = asyncio.Semaphore(6)
async def make(l):
    k = l['key']; path = f"audio/{k}.mp3"
    prev = old.get(k)
    if isinstance(prev, dict) and prev.get('w') and os.path.exists(path):
        manifest[k] = prev; return
    v, rate, pitch = VOICES[l['who']]
    async with sem:
        for attempt in range(4):
            try:
                audio, words = bytearray(), []
                async for ch in edge_tts.Communicate(l['text'], v, rate=rate, pitch=pitch, boundary='WordBoundary').stream():
                    if ch['type'] == 'audio': audio += ch['data']
                    elif ch['type'] == 'WordBoundary':
                        s = ch['offset'] / 10000; words.append([round(s), round(s + ch['duration'] / 10000), ch['text']])
                open(path, 'wb').write(audio)
                manifest[k] = {'f': f"{k}.mp3", 'w': words}; return
            except Exception:
                await asyncio.sleep(2 * (attempt + 1))
        print('FAILED', l)
async def main():
    await asyncio.gather(*(make(l) for l in lines))
    keep = {f"{l['key']}.mp3" for l in lines}
    for f in os.listdir('audio'):
        if f.endswith('.mp3') and f not in keep: os.remove(os.path.join('audio', f))
    json.dump(manifest, open('audio/manifest.json', 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
    print('recorded', len(manifest), 'of', len(lines), '| with word timings:', sum(1 for m in manifest.values() if m['w']))
asyncio.run(main())
