import { MaxRectsPacker, PACKING_LOGIC } from "maxrects-packer";
import { createSpriteJson } from "./sprite-json";
import type {
  PackedIcon,
  SpriteOptions,
  SpritePackingLogic,
  SpriteResult,
  SpriteRotation,
  SvgIconInput,
} from "./types";

const defaultSpriteOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  padding: 2,
  border: 1,
  smart: true,
  pot: false,
  square: false,
  allowRotation: false,
  logic: "max-edge",
  preserveOrder: false,
} as const;

type PackableIcon = SvgIconInput & {
  x: number;
  y: number;
  sourceWidth: number;
  sourceHeight: number;
  rotation: SpriteRotation;
  rot?: boolean;
  oversized?: boolean;
};

export function createSprite(icons: SvgIconInput[], options: SpriteOptions = {}): SpriteResult {
  const resolvedOptions = resolveSpriteOptions(options);
  const uniqueIcons = dedupeIconsByName(icons);

  if (uniqueIcons.length === 0) {
    return {
      width: 0,
      height: 0,
      icons: [],
      json: {},
    };
  }

  const packableIcons = uniqueIcons.map(toPackableIcon);

  for (const icon of packableIcons) {
    if (icon.width > resolvedOptions.maxWidth || icon.height > resolvedOptions.maxHeight) {
      throw new Error(
        `Icon "${icon.name}" (${icon.width}x${icon.height}) exceeds the sprite bounds ${resolvedOptions.maxWidth}x${resolvedOptions.maxHeight}.`,
      );
    }
  }

  const packer = new MaxRectsPacker<PackableIcon>(
    resolvedOptions.maxWidth,
    resolvedOptions.maxHeight,
    resolvedOptions.padding,
    {
      smart: resolvedOptions.smart,
      pot: resolvedOptions.pot,
      square: resolvedOptions.square,
      allowRotation: false,
      border: resolvedOptions.border,
      logic: toPackerLogic(resolvedOptions.logic),
    },
  );

  if (resolvedOptions.preserveOrder) {
    for (const icon of packableIcons) {
      packer.add(icon);
    }
  } else {
    packer.addArray(packableIcons);
  }

  if (packer.bins.length !== 1) {
    throw new Error(
      `Icons could not fit into a single sprite within ${resolvedOptions.maxWidth}x${resolvedOptions.maxHeight}.`,
    );
  }

  const [bin] = packer.bins;
  const orderIndexById = new Map(packableIcons.map((icon, index) => [icon.id, index]));
  const packedIcons = bin.rects.map(toPackedIcon).sort((left, right) => {
    if (resolvedOptions.preserveOrder) {
      return (orderIndexById.get(left.id) ?? 0) - (orderIndexById.get(right.id) ?? 0);
    }

    if (left.y !== right.y) {
      return left.y - right.y;
    }

    return left.x - right.x;
  });

  return {
    width: bin.width,
    height: bin.height,
    icons: packedIcons,
    json: createSpriteJson(packedIcons, 1),
  };
}

export function resolveSpriteOptions(options: SpriteOptions = {}): Required<SpriteOptions> {
  if (options.allowRotation === true) {
    throw new Error("Sprite icon rotation is not supported. Set allowRotation to false.");
  }

  return {
    ...defaultSpriteOptions,
    ...options,
    allowRotation: false,
  };
}

function toPackerLogic(logic: SpritePackingLogic): PACKING_LOGIC {
  return logic === "max-area" ? PACKING_LOGIC.MAX_AREA : PACKING_LOGIC.MAX_EDGE;
}

function dedupeIconsByName(icons: SvgIconInput[]): SvgIconInput[] {
  const byName = new Map<string, SvgIconInput>();

  for (const icon of icons) {
    byName.set(icon.name, icon);
  }

  return [...byName.values()];
}

function toPackableIcon(icon: SvgIconInput): PackableIcon {
  const rotation = normalizeRotation(icon.rotation);
  const rotatesBounds = rotation === 90 || rotation === 270;

  return {
    ...icon,
    sourceWidth: icon.width,
    sourceHeight: icon.height,
    width: rotatesBounds ? icon.height : icon.width,
    height: rotatesBounds ? icon.width : icon.height,
    rotation,
    x: 0,
    y: 0,
  };
}

function normalizeRotation(rotation: SvgIconInput["rotation"]): SpriteRotation {
  return rotation === 90 || rotation === 180 || rotation === 270 ? rotation : 0;
}

function toPackedIcon(rect: PackableIcon): PackedIcon {
  if (rect.oversized) {
    throw new Error(`Icon "${rect.name}" is too large for the configured sprite bounds.`);
  }

  if (rect.rot) {
    throw new Error(`Icon "${rect.name}" was rotated during packing, which is not supported.`);
  }

  if (typeof rect.x !== "number" || typeof rect.y !== "number") {
    throw new Error(`Icon "${rect.name}" was not assigned a packed position.`);
  }

  return {
    id: rect.id,
    name: rect.name,
    fileName: rect.fileName,
    svgText: rect.svgText,
    width: rect.width,
    height: rect.height,
    sourceWidth: rect.sourceWidth,
    sourceHeight: rect.sourceHeight,
    rotation: rect.rotation,
    viewBox: rect.viewBox,
    x: rect.x,
    y: rect.y,
  };
}
