import { describe, expect, it } from "vitest";
import { normalizeIconName } from "./normalize";

describe("normalizeIconName", () => {
  it("normalizes SVG file names for map sprite IDs", () => {
    expect(normalizeIconName("Gas Valve.svg")).toBe("gas-valve");
    expect(normalizeIconName("Alarm_Point.svg")).toBe("alarm_point");
    expect(normalizeIconName("Pressure #1.svg")).toBe("pressure-1");
  });

  it("falls back when a file name has no usable characters", () => {
    expect(normalizeIconName("。。。 .svg")).toBe("icon");
  });
});
