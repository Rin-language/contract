import { describe, expect, expectTypeOf, it } from "vitest";
import { JlptLevel } from "../src/jlpt-level.js";

describe("JlptLevel", () => {
  it.each(["N5", "N4", "N3", "N2", "N1"])("accepts %s", (level) => {
    expect(JlptLevel.safeParse(level).success).toBe(true);
  });

  it.each(["N6", "n3", "", "N", "3"])("rejects unknown level %j", (level) => {
    expect(JlptLevel.safeParse(level).success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(JlptLevel.safeParse(3).success).toBe(false);
  });

  it("infers the union of the five levels", () => {
    expectTypeOf<JlptLevel>().toEqualTypeOf<"N5" | "N4" | "N3" | "N2" | "N1">();
  });
});
