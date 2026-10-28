import { describe, expect, expectTypeOf, it } from "vitest";
import { LanguageCode } from "../src/language-code.js";

describe("LanguageCode", () => {
  it.each(["ja", "zh", "fr", "en", "ko"])("accepts %s", (code) => {
    expect(LanguageCode.safeParse(code).success).toBe(true);
  });

  it.each([
    ["a region suffix", "zh-CN"],
    ["a script suffix", "zh-Hans"],
    ["uppercase letters", "JA"],
    ["a capitalised code", "Ja"],
    ["a three-letter code", "jpn"],
    ["a single letter", "j"],
    ["an empty string", ""],
    ["surrounding whitespace", " ja"],
    ["a trailing newline", "ja\n"],
    ["digits", "j1"],
    ["a non-ASCII letter", "éa"],
  ])("rejects %s", (_label, code) => {
    expect(LanguageCode.safeParse(code).success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(LanguageCode.safeParse(1).success).toBe(false);
  });

  it("accepts any well-formed code, whether or not ISO 639-1 assigns it", () => {
    expect(LanguageCode.safeParse("xx").success).toBe(true);
  });

  it("infers a string", () => {
    expectTypeOf<LanguageCode>().toEqualTypeOf<string>();
  });
});
