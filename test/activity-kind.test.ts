import { describe, expect, expectTypeOf, it } from "vitest";
import { ActivityKind } from "../src/activity-kind.js";

describe("ActivityKind", () => {
  it.each(["writing", "reading", "listening", "speaking", "shadowing"])(
    "accepts %s, including a kind added later",
    (kind) => {
      expect(ActivityKind.safeParse(kind).success).toBe(true);
    },
  );

  it.each([
    ["an empty string", ""],
    ["a whitespace-only string", " \n\t　"],
  ])("rejects %s", (_label, kind) => {
    expect(ActivityKind.safeParse(kind).success).toBe(false);
  });

  it.each([1, null, undefined])("rejects the non-string value %j", (kind) => {
    expect(ActivityKind.safeParse(kind).success).toBe(false);
  });

  it("infers a string", () => {
    expectTypeOf<ActivityKind>().toEqualTypeOf<string>();
  });
});
