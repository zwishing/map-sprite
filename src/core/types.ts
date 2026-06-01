export interface SvgIconInput {
  id: string;
  name: string;
  fileName: string;
  svgText: string;
  width: number;
  height: number;
  rotation?: SpriteRotation;
  viewBox?: string;
}

export type SpriteRotation = 0 | 90 | 180 | 270;

export interface PackedIcon {
  id: string;
  name: string;
  fileName: string;
  svgText: string;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  rotation: SpriteRotation;
  viewBox?: string;
  x: number;
  y: number;
}

export interface SpriteJsonItem {
  width: number;
  height: number;
  x: number;
  y: number;
  pixelRatio: number;
}

export interface SpriteResult {
  width: number;
  height: number;
  icons: PackedIcon[];
  json: Record<string, SpriteJsonItem>;
}

export type SpritePackingLogic = "max-edge" | "max-area";

export interface SpriteOptions {
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  border?: number;
  smart?: boolean;
  pot?: boolean;
  square?: boolean;
  allowRotation?: boolean;
  logic?: SpritePackingLogic;
  preserveOrder?: boolean;
}

export interface RenderSpriteOptions {
  pixelRatio?: 1 | 2;
}

export type SpritePngRenderer = (
  sprite: SpriteResult,
  options?: RenderSpriteOptions,
) => Promise<Blob>;

export interface ExportSpriteZipOptions {
  includeNormal?: boolean;
  includeRetina?: boolean;
  renderPng?: SpritePngRenderer;
}

export type SpriteJson = Record<string, SpriteJsonItem>;
