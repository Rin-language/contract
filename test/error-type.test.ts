import { describe, expect, expectTypeOf, it } from "vitest";
import { ErrorType } from "../src/error-type.js";

describe("ErrorType", () => {
  it.each(["particles", "other", "keigo_politeness", "articles", "tones"])(
    "accepts the id %s, whichever language it comes from",
    (errorType) => {
      expect(ErrorType.safeParse(errorType).success).toBe(true);
    },
  );

  it.each([
    ["an empty string", ""],
    ["a whitespace-only string", " \n\t　 "],
  ])("rejects %s", (_label, errorType) => {
    expect(ErrorType.safeParse(errorType).success).toBe(false);
  });

  it.each([1, null, undefined, ["particles"]])(
    "rejects the non-string value %j",
    (errorType) => {
      expect(ErrorType.safeParse(errorType).success).toBe(false);
    },
  );

  it("infers a string", () => {
    expectTypeOf<ErrorType>().toEqualTypeOf<string>();
  });
});
