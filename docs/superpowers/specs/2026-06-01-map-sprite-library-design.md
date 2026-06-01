# Map Sprite Library Design

## Goal

Build a small TypeScript library for generating MapLibre / Mapbox-compatible sprite assets from SVG icons. The library must be easy for third-party systems to integrate, and the repository should include one simple React example that demonstrates common browser usage.

The first version focuses on:

- SVG parsing and icon name normalization.
- Automatic sprite packing with no rotation.
- MapLibre / Mapbox `sprite.json` generation.
- Browser-side transparent PNG rendering.
- Browser-side ZIP export containing normal and 2x sprite assets.
- A simple React example for upload, preview, JSON inspection, deletion, and export.

## Recommended Approach

Use a framework-independent TypeScript core library plus a minimal React example.

This keeps the reusable logic independent from React, Vue, or any specific host system. Third-party systems can call the core APIs directly and build their own UI, while the React example shows the intended integration path without becoming the required runtime surface.

## Package Shape

```text
src/
  core/
    index.ts
    normalize.ts
    parse-svg.ts
    pack.ts
    sprite-json.ts
    render-png.ts
    export-zip.ts
  index.ts
examples/
  react-basic/
    src/
      App.tsx
      main.tsx
```

The top-level package exports the core APIs from `src/index.ts`. The example imports from the local package source during development.

## Public API

The first version exposes these functions:

```ts
normalizeIconName(fileName: string): string
parseSvgText(svgText: string, fileName: string): SvgIconInput
createSprite(icons: SvgIconInput[], options?: SpriteOptions): SpriteResult
renderSpritePng(sprite: SpriteResult, options?: RenderSpriteOptions): Promise<Blob>
exportSpriteZip(sprite: SpriteResult, options?: ExportSpriteZipOptions): Promise<Blob>
```

Core data types:

```ts
interface SvgIconInput {
  id: string;
  name: string;
  fileName: string;
  svgText: string;
  width: number;
  height: number;
  viewBox?: string;
}

interface PackedIcon extends SvgIconInput {
  x: number;
  y: number;
}

interface SpriteJsonItem {
  width: number;
  height: number;
  x: number;
  y: number;
  pixelRatio: number;
}

interface SpriteResult {
  width: number;
  height: number;
  icons: PackedIcon[];
  json: Record<string, SpriteJsonItem>;
}

interface RenderSpriteOptions {
  pixelRatio?: 1 | 2;
}

interface ExportSpriteZipOptions {
  includeNormal?: boolean;
  includeRetina?: boolean;
}
```

## Behavior

Icon names are generated from file names by removing the `.svg` suffix, converting to lowercase, replacing spaces with `-`, and removing characters outside letters, numbers, `_`, and `-`.

If multiple icons resolve to the same name, the later icon replaces the earlier one. This matches the requested first-version conflict behavior and keeps imports predictable.

Packing uses `maxrects-packer` with these defaults:

```ts
{
  maxWidth: 1024,
  maxHeight: 1024,
  padding: 2,
  border: 1,
  smart: true,
  pot: false,
  square: false,
  allowRotation: false
}
```

`allowRotation` is always forced to `false` because rotated map icons would render incorrectly in downstream MapLibre / Mapbox styles.

The generated `sprite.json` uses the standard shape:

```json
{
  "valve": {
    "width": 32,
    "height": 32,
    "x": 0,
    "y": 0,
    "pixelRatio": 1
  }
}
```

## Rendering And Export

`renderSpritePng` renders SVG icons into an offscreen canvas and returns a transparent PNG `Blob`. It uses the packed icon coordinates from `SpriteResult`, so the PNG and JSON stay aligned. When called with `pixelRatio: 2`, it doubles the canvas dimensions and draws each icon at 2x size while preserving the logical icon coordinates in the returned sprite metadata.

`exportSpriteZip` creates a ZIP `Blob` containing normal and 2x sprite assets by default:

```text
sprite.png
sprite.json
sprite@2x.png
sprite@2x.json
```

The normal JSON uses `pixelRatio: 1`. The 2x JSON uses the same logical icon names and positions scaled for the 2x PNG, with `pixelRatio: 2`, so it can be referenced by MapLibre / Mapbox as a standard retina sprite.

The core library does not depend on `file-saver`. Host systems can decide whether to download, upload, preview, or store the returned blobs.

## React Example

The example is intentionally small. It provides:

- SVG file selection.
- Drag-and-drop onto the preview area.
- Automatic layout after add or delete.
- Canvas preview of the sprite.
- Click selection.
- Delete button and Delete / Backspace removal.
- JSON preview.
- ZIP export button.
- Normal and 2x ZIP assets.

The example keeps Canvas as a view and interaction layer only. The icon list is the source of truth, and each change calls `createSprite` again.

## Error Handling

The core library reports clear errors for:

- Empty SVG text.
- SVG files without usable dimensions or `viewBox`.
- Icons larger than the configured maximum sprite size.
- Packing failures when icons cannot fit inside the configured bounds.
- PNG export failures caused by image decoding or canvas conversion errors.
- Invalid export options that disable both normal and 2x outputs.

The example displays these errors in a compact message area without adding a global notification dependency.

## Dependencies

Runtime dependencies:

- `maxrects-packer`
- `jszip`

Development dependencies:

- `typescript`
- `vite`
- `react`
- `react-dom`
- `vitest`
- React/Vite type tooling as needed

No new UI component library is needed for the first version.

## Testing

Core tests should cover:

- Icon name normalization.
- SVG size parsing from width / height.
- SVG size parsing from `viewBox`.
- Same-name replacement.
- Sprite JSON coordinate generation.
- 2x sprite JSON coordinate and `pixelRatio` generation.
- Rotation disabled in pack options.

The example can be verified with a production build. If browser automation is available, a smoke test can upload sample SVGs and confirm JSON/export controls render.

## Out Of Scope For Version 1

- Icon renaming UI.
- Icon grouping.
- Importing existing `sprite.json`.
- Batch icon resizing.
- SVGO optimization.
- Uploading generated assets to a backend service.
- Generating a complete MapLibre style file.

These can be added later without changing the core package boundary.

## Known Repository Constraint

The current workspace is not a Git repository. The design document can be written, but it cannot be committed unless a Git repository is initialized or the project is moved into an existing repository.
