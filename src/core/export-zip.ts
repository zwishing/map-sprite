import JSZip from "jszip";
import { renderSpritePng } from "./render-png";
import { createRetinaSpriteJson } from "./sprite-json";
import type { ExportSpriteZipOptions, SpriteResult } from "./types";

export async function exportSpriteZip(
  sprite: SpriteResult,
  options: ExportSpriteZipOptions = {},
): Promise<Blob> {
  const includeNormal = options.includeNormal ?? true;
  const includeRetina = options.includeRetina ?? true;
  const pngRenderer = options.renderPng ?? renderSpritePng;

  if (!includeNormal && !includeRetina) {
    throw new Error("At least one sprite output must be enabled.");
  }

  const zip = new JSZip();

  if (includeNormal) {
    zip.file("sprite.png", await pngRenderer(sprite, { pixelRatio: 1 }));
    zip.file("sprite.json", JSON.stringify(sprite.json, null, 2));
  }

  if (includeRetina) {
    zip.file("sprite@2x.png", await pngRenderer(sprite, { pixelRatio: 2 }));
    zip.file("sprite@2x.json", JSON.stringify(createRetinaSpriteJson(sprite), null, 2));
  }

  return zip.generateAsync({ type: "blob" });
}
