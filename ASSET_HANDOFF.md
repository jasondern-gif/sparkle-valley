# Sparkle Valley — Art Asset Handoff

This file is the contract between the game and whoever (or whichever AI) produces image art.
It covers the **technical** requirements only. Style, palette and design choices are up to the art producer.

The game draws everything procedurally today. An image is used only if it is listed in
`assets/manifest.json`, loads successfully, and matches its declared size; otherwise the original
drawing is used automatically. A broken or missing file can never break the game.

## 1. Image rules (all assets)

| Rule | Value |
|---|---|
| Format | PNG, 8-bit RGBA, transparent background |
| Native scale | **24 px = 1 world tile** (`tilePx` in the manifest) |
| Frame layout | Equal-size frames in a grid, numbered left→right, top→bottom, starting at 0 |
| Image size | Must equal the manifest `size` exactly (mismatch ⇒ asset rejected, procedural art used) |
| Scaling | The game scales art to the world size with nearest-neighbour sampling (`pixelArt: true`) |
| Facing | Characters face **right**; the game mirrors them for left |
| Do NOT include | Ground shadows, the walking bob, accessories (bows, crowns…), chimney smoke, text — the game draws these on top |
| Do NOT include | The magenta frame borders seen in the placeholders (they only show frame bounds) |

Native art resolution and world size are separate: art is always stretched to `world × tile size`
on screen. Art never changes world coordinates, the camera, collisions or hit areas.

## 2. Manifest format (`assets/manifest.json`)

```json
{
  "schema": 1,
  "tilePx": 24,
  "assets": {
    "<id>": {
      "src": "folder/file.png",
      "size": [imageWidthPx, imageHeightPx],
      "frameSize": [frameWidthPx, frameHeightPx],
      "world": [widthInTiles, heightInTiles],
      "origin": "bottom-center",
      "pixelArt": true,
      "animations": {
        "<name>": { "frames": [0, 1, 2], "fps": 8, "loop": true }
      }
    }
  }
}
```

| Field | Required | Meaning |
|---|---|---|
| `src` | yes | Path relative to `assets/`. Folders: `tiles/ buildings/ characters/ crops/ items/ ui/ effects/` |
| `size` | yes | Whole image size in pixels. Must match the PNG exactly |
| `frameSize` | no | Size of one frame; must divide `size` evenly. Default = `size` (single frame) |
| `world` | yes | On-screen size of one frame in world tiles. Should equal `frameSize / tilePx` (a warning is logged otherwise) |
| `origin` | no | `"bottom-center"` (default) or `"top-left"`: which point of the frame sits on the game's anchor point |
| `pixelArt` | no | `true` (default) = crisp nearest-neighbour scaling; `false` = smooth scaling |
| `animations` | no | Named frame lists. `fps` 0/absent = static first frame. `loop` defaults to `true`; `false` holds the last frame |

Frame index `n` is at column `n % cols`, row `floor(n / cols)` where `cols = size[0] / frameSize[0]`.
Unknown fields are ignored. Ids, animation names and file names are case-sensitive.

## 3. Prototype assets (the only ones the game uses right now)

Coordinates below are in tiles relative to the anchor point; +x = right, +y = down.

### `tree` — `tiles/tree.png`
- Frames 36×48 px (world 1.5×2 tiles), 4 frames → image **144×48**. Origin `bottom-center`.
- Anchor = base of the trunk (game draws it 0.9 tiles below the top of the tree's tile, horizontally centred).
- Animations (one frame each), matching the existing four tree kinds:
  `round` (0), `blossom` (1, pink-flowered), `apple` (2, red fruit), `pine` (3).
- The game adds the ground shadow and a gentle sway (skew around the base).

### `crop_carrot` — `crops/carrot.png`
- Frames 24×24 px (world 1×1), 3 frames → image **72×24**. Origin `bottom-center`.
- Anchor = soil line of the garden plot (0.35 tiles below the plot centre). Plant grows upward from it.
- Animations: `stage1` sprout, `stage2` leafy, `stage3` ripe (ready to harvest). Each may have several frames + `fps`.
- Stage 0 (seed dots), watering-drop bubble, ripe bounce and sparkle are drawn by the game.

### `farmhouse` — `buildings/farmhouse.png`
- Single frame **120×108** px (world 5×4.5). Origin `bottom-center`.
- Anchor = world (5, 6): the bottom-centre of the house footprint (tiles x 3–6, y 2–5). Frame covers world x 2.5–7.5, y 1.5–6.
- Within the frame (px): walls about x 17–103 with the base on the bottom edge; the front path meets the door at x ≈ 63–81.
- **Chimney** must sit at px x ≈ 80–90 with its top at px y ≈ 21: the game draws live smoke rising from there.

### `buttercup` — `characters/buttercup.png` (the pony)
- Frames 36×36 px (world 1.5×1.5), 5 frames → image **180×36**. Origin `bottom-center`. Faces **right**.
- Anchor = ground point between the hooves (entity position).
- Animations: `idle` (frame 0, may be several frames + `fps`), `walk` (frames 1–4, 8 fps). Walk time only
  advances while she moves; the game adds the up-and-down bob itself, so keep hooves on the bottom edge in every frame.
- Attachment points (must match so accessories line up):
  - **Head centre** at (+0.40, −0.88) tiles = frame px **(27.6, 14.9)**. Bow, flower crown and gift accessories are drawn here.
  - **Back / saddle top** at about −0.6 tiles = frame px y ≈ **21.6**, x ≈ 18. The rider sits here.
- No horn, no wings (the game falls back to the drawn pony if a look needs them).

## 4. Adding art safely

1. Put the PNG in the right folder and set `size`/`frameSize`/`world` exactly.
2. Keep ids and animation names from section 3 (new ids need a matching code wrapper first).
3. Open the game normally and with `?assets=off` to compare; the console shows one `[assets]` warning
   per problem (bad size, missing file, missing animation) and that object keeps its drawn art.
4. `node assets/make_placeholders.js` regenerates the placeholder images (overwrites the art files).
