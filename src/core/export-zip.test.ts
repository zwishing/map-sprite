import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { exportSpriteZip } from "./export-zip";
import { createSprite } from "./pack";
import type { RenderSpriteOptions } from "./types";

describe("exportSpriteZip", () => {
  it("exports normal and retina sprite assets by default", async () => {
    const sprite = createSprite([
      {
        id: "valve",
        name: "valve",
        fileName: "valve.svg",
        svgText: '<svg width="10" height="10"></svg>',
        width: 10,
        height: 10,
      },
    ]);

    const zipBlob = await exportSpriteZip(sprite, { renderPng: fakePngRenderer });
    const zip = await JSZip.loadAsync(zipBlob);

    expect(zip.file("sprite.png")).toBeTruthy();
    expect(zip.file("sprite.json")).toBeTruthy();
    expect(zip.file("sprite@2x.png")).toBeTruthy();
    expect(zip.file("sprite@2x.json")).toBeTruthy();

    const retinaJson = JSON.parse(await zip.file("sprite@2x.json")!.async("text"));
    expect(retinaJson.valve.pixelRatio).toBe(2);
    expect(retinaJson.valve.width).toBe(20);
  });

  it("rejects disabled normal and retina outputs", async () => {
    const sprite = createSprite([]);

    await expect(
      exportSpriteZip(sprite, {
        includeNormal: false,
        includeRetina: false,
        renderPng: fakePngRenderer,
      }),
    ).rejects.toThrow(/At least one/);
  });
});

async function fakePngRenderer(_sprite: unknown, options?: RenderSpriteOptions): Promise<Blob> {
  return new Blob([`png-${options?.pixelRatio ?? 1}`], { type: "image/png" });
}
