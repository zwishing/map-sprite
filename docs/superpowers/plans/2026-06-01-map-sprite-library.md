# Map Sprite Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a framework-independent TypeScript library that creates MapLibre / Mapbox sprite assets from SVG files, plus a minimal React example.

**Architecture:** The core package owns parsing, packing, JSON generation, PNG rendering, and ZIP export. The React example owns UI state, canvas preview, selection, deletion, and download wiring. The package exports browser-oriented APIs without depending on a specific frontend framework.

**Tech Stack:** TypeScript, Vite library build, Vitest, React, Canvas, `maxrects-packer`, `jszip`.

---

## File Structure

- Create `package.json`: workspace scripts, library metadata, runtime and dev dependencies.
- Create `tsconfig.json`: strict TypeScript settings for source, tests, and example.
- Create `vite.config.ts`: library build and Vitest environment.
- Create `index.html`: Vite entry for the React example.
- Create `src/index.ts`: public library exports.
- Create `src/core/types.ts`: shared public types.
- Create `src/core/normalize.ts`: icon name normalization.
- Create `src/core/parse-svg.ts`: SVG text parsing and dimension extraction.
- Create `src/core/sprite-json.ts`: normal and 2x JSON generation helpers.
- Create `src/core/pack.ts`: maxrects packing and sprite result creation.
- Create `src/core/render-png.ts`: browser canvas PNG rendering at 1x or 2x.
- Create `src/core/export-zip.ts`: ZIP export containing normal and retina assets.
- Create `src/core/index.ts`: core barrel export.
- Create `src/core/*.test.ts`: focused core tests.
- Create `examples/react-basic/src/App.tsx`: simple integration UI.
- Create `examples/react-basic/src/main.tsx`: React entry.
- Create `examples/react-basic/src/App.css`: example styling.
- Create `README.md`: install, API, and example usage.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

- [ ] **Step 1: Create project config files**

Use a Vite library setup with React available for the example. Scripts:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` are created.

## Task 2: Core Types, Normalize, And SVG Parsing

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/normalize.ts`
- Create: `src/core/parse-svg.ts`
- Create: `src/core/normalize.test.ts`
- Create: `src/core/parse-svg.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:

```ts
expect(normalizeIconName("Gas Valve.svg")).toBe("gas-valve");
expect(normalizeIconName("Alarm_Point.svg")).toBe("alarm_point");
expect(parseSvgText('<svg width="32" height="24"></svg>', "a.svg").width).toBe(32);
expect(parseSvgText('<svg viewBox="0 0 16 20"></svg>', "b.svg").height).toBe(20);
```

- [ ] **Step 2: Implement types, normalization, and parsing**

Create `SvgIconInput`, `PackedIcon`, `SpriteJsonItem`, `SpriteResult`, `SpriteOptions`, `RenderSpriteOptions`, and `ExportSpriteZipOptions`. Parse dimensions from `width` / `height` first, then from `viewBox`.

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected: normalize and parse tests pass.

## Task 3: Packing And Sprite JSON

**Files:**
- Create: `src/core/sprite-json.ts`
- Create: `src/core/pack.ts`
- Create: `src/core/pack.test.ts`

- [ ] **Step 1: Write failing tests**

Cover same-name replacement, generated coordinates, `pixelRatio: 1`, retina JSON scaling with `pixelRatio: 2`, and explicit rejection of `allowRotation: true`.

- [ ] **Step 2: Implement packing**

Use `maxrects-packer`, default to `1024x1024`, force `allowRotation: false`, and return `SpriteResult` with packed icons and standard JSON.

- [ ] **Step 3: Implement 2x JSON helper**

Generate 2x JSON by scaling width, height, x, and y by 2 and setting `pixelRatio: 2`.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
```

Expected: all core tests pass.

## Task 4: PNG Rendering And ZIP Export

**Files:**
- Create: `src/core/render-png.ts`
- Create: `src/core/export-zip.ts`
- Create: `src/core/export-zip.test.ts`

- [ ] **Step 1: Write ZIP export test**

Use a tiny SVG icon, create a sprite, export ZIP, and verify these entries exist:

```text
sprite.png
sprite.json
sprite@2x.png
sprite@2x.json
```

- [ ] **Step 2: Implement PNG rendering**

Create a transparent canvas, draw each SVG through a blob URL or data URL image, scale canvas and draw dimensions by the selected pixel ratio, and return a PNG `Blob`.

- [ ] **Step 3: Implement ZIP export**

Use `JSZip` to include normal and retina assets by default. Validate that at least one of `includeNormal` or `includeRetina` is enabled.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
```

Expected: ZIP structure test and prior tests pass.

## Task 5: Public Exports And React Example

**Files:**
- Create: `src/core/index.ts`
- Create: `src/index.ts`
- Create: `examples/react-basic/src/main.tsx`
- Create: `examples/react-basic/src/App.tsx`
- Create: `examples/react-basic/src/App.css`

- [ ] **Step 1: Export library API**

Export all public functions and public types from `src/index.ts`.

- [ ] **Step 2: Build React example**

Implement SVG file upload, drag-and-drop, list deletion, canvas preview, selected icon details, JSON preview, and ZIP download.

- [ ] **Step 3: Keep example state simple**

Use React state for `icons`, `selectedIconId`, and `error`. Recompute `createSprite(icons)` with `useMemo`.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

## Task 6: Documentation And Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Document installation and API**

Include a concise example for parsing SVG text, creating a sprite, rendering PNG, and exporting ZIP.

- [ ] **Step 2: Run all verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands complete successfully.

- [ ] **Step 3: Manual example smoke check**

Start:

```bash
npm run dev
```

Open the local URL, upload sample SVG files, confirm JSON updates, and confirm export includes normal and `@2x` assets.

## Self-Review

Spec coverage:

- Framework-independent TypeScript core: covered by Tasks 2-5.
- React example: covered by Task 5.
- SVG parsing and normalization: covered by Task 2.
- `maxrects-packer` layout with no rotation: covered by Task 3.
- normal and `@2x` JSON / PNG / ZIP export: covered by Tasks 3-4.
- Tests, typecheck, and build verification: covered by Task 6.

Placeholder scan: no unfinished-marker or deferred implementation placeholders are intentionally left in this plan.

Type consistency: public types are defined before downstream tasks, and all task references use the same function names as the design spec.
