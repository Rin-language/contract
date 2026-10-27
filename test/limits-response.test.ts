import { describe, expect, expectTypeOf, it } from "vitest";
import { LimitsResponse } from "../src/limits-response.js";

const validLimits = {
  maxTextLength: 2000,
  maxEdits: 100,
  maxExplanationLength: 500,
};

describe("LimitsResponse", () => {
  it("accepts valid limits", () => {
    expect(LimitsResponse.safeParse(validLimits).success).toBe(true);
  });

  it.each(["maxTextLength", "maxEdits", "maxExplanationLength"])(
    "rejects a negative %s",
    (key) => {
      expect(
        LimitsResponse.safeParse({ ...validLimits, [key]: -1 }).success,
      ).toBe(false);
    },
  );

  it.each(["maxTextLength", "maxEdits", "maxExplanationLength"])(
    "rejects a zero %s",
    (key) => {
      expect(
        LimitsResponse.safeParse({ ...validLimits, [key]: 0 }).success,
      ).toBe(false);
    },
  );

  it.each(["maxTextLength", "maxEdits", "maxExplanationLength"])(
    "rejects a non-integer %s",
    (key) => {
      expect(
        LimitsResponse.safeParse({ ...validLimits, [key]: 10.5 }).success,
      ).toBe(false);
    },
  );

  it.each(["maxTextLength", "maxEdits", "maxExplanationLength"])(
    "rejects a missing %s",
    (key) => {
      const { [key]: _removed, ...incomplete } = validLimits as Record<
        string,
        number
      >;

      expect(LimitsResponse.safeParse(incomplete).success).toBe(false);
    },
  );

  it("rejects a numeric string", () => {
    expect(
      LimitsResponse.safeParse({ ...validLimits, maxEdits: "100" }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      LimitsResponse.safeParse({ ...validLimits, maxRequests: 5 }).success,
    ).toBe(false);
  });

  it.each([
    ["an array at the root", [validLimits]],
    ["free text", "limits: 2000"],
    ["null", null],
  ])("rejects %s", (_label, input) => {
    expect(LimitsResponse.safeParse(input).success).toBe(false);
  });

  it("infers the limits type from the schema", () => {
    expectTypeOf<LimitsResponse>().toEqualTypeOf<{
      maxTextLength: number;
      maxEdits: number;
      maxExplanationLength: number;
    }>();
  });
});
