import type { PackedIcon, SpriteJson, SpriteJsonItem, SpriteResult } from "./types";

export function createSpriteJson(icons: PackedIcon[], pixelRatio: 1 | 2 = 1): SpriteJson {
  return icons.reduce<SpriteJson>((json, icon) => {
    json[icon.name] = createSpriteJsonItem(icon, pixelRatio);
    return json;
  }, {});
}

export function createRetinaSpriteJson(sprite: SpriteResult): SpriteJson {
  return createSpriteJson(sprite.icons, 2);
}

function createSpriteJsonItem(icon: PackedIcon, pixelRatio: 1 | 2): SpriteJsonItem {
  return {
    width: icon.width * pixelRatio,
    height: icon.height * pixelRatio,
    x: icon.x * pixelRatio,
    y: icon.y * pixelRatio,
    pixelRatio
  };
}
