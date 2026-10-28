import { describe, expect, expectTypeOf, it } from "vitest";
import { Level } from "../src/level.js";

describe("Level", () => {
  it.each(["N5", "N1", "A1", "C2", "HSK 3", "TOPIK1"])(
    "accepts %s, whichever scale it comes from",
    (level) => {
      expect(Level.safeParse(level).success).toBe(true);
    },
  );

  it.each([
    ["an empty string", ""],
    ["a whitespace-only string", " \t　"],
  ])("rejects %s", (_label, level) => {
    expect(Level.safeParse(level).success).toBe(false);
  });

  it.each([3, null, undefined])("rejects the non-string value %j", (level) => {
    expect(Level.safeParse(level).success).toBe(false);
  });

  it("infers a string", () => {
    expectTypeOf<Level>().toEqualTypeOf<string>();
  });
});
