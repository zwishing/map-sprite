import type { SpritePackingLogic, SpriteResult, SvgIconInput } from "../core";

export type MapSpriteEditorLayout = SpritePackingLogic | "custom";

export interface MapSpriteEditorOptions {
  container: HTMLElement | string;
  icons?: SvgIconInput[];
  logic?: MapSpriteEditorLayout;
  padding?: number;
  zoom?: number;
  themeColor?: string;
  onChange?: (state: MapSpriteEditorState) => void;
  onError?: (error: Error) => void;
}

export interface MapSpriteEditorState {
  icons: SvgIconInput[];
  sprite: SpriteResult;
}
