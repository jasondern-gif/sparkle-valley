"""Generates natural-sounding voice recordings for every line in lines.json (uses Microsoft neural voices via edge-tts)."""
import asyncio, json, os, edge_tts
VOICES = {
    'narrator':  ('en-US-AvaNeural',     '-5%',  '+0Hz'),
    'grandma':   ('en-GB-SoniaNeural',   '-10%', '-4Hz'),
    'hops':      ('en-US-RogerNeural',   '+0%',  '+12Hz'),
    'buttercup': ('en-GB-MaisieNeural',  '-5%',  '+0Hz'),
    'stardust':  ('en-US-AnaNeural',     '-5%',  '+0Hz'),
}
lines = json.load(open('lines.json', encoding='utf-8'))
os.makedirs('audio', exist_ok=True)
sem = asyncio.Semaphore(6)
async def make(l):
    path = f"audio/{l['key']}.mp3"
    if os.path.exists(path) and os.path.getsize(path) > 0: return
    v, rate, pitch = VOICES[l['who']]
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(l['text'], v, rate=rate, pitch=pitch).save(path); return
            except Exception as e:
                await asyncio.sleep(2 * (attempt + 1))
        print('FAILED', l)
async def main():
    await asyncio.gather(*(make(l) for l in lines))
    keep = {f"{l['key']}.mp3" for l in lines}
    for f in os.listdir('audio'):
        if f.endswith('.mp3') and f not in keep: os.remove(os.path.join('audio', f))
    manifest = {l['key']: f"{l['key']}.mp3" for l in lines if os.path.exists(f"audio/{l['key']}.mp3")}
    json.dump(manifest, open('audio/manifest.json', 'w'), indent=0)
    print('recorded', len(manifest), 'of', len(lines))
asyncio.run(main())
