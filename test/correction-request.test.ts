import { describe, expect, expectTypeOf, it } from "vitest";
import { API_VERSION } from "../src/constants.js";
import { CorrectionRequest } from "../src/correction-request.js";
import type { JlptLevel } from "../src/jlpt-level.js";

describe("constants", () => {
  it("exposes the API version", () => {
    expect(API_VERSION).toBe("v1");
  });
});

describe("CorrectionRequest", () => {
  it("accepts a request with text only", () => {
    expect(CorrectionRequest.safeParse({ text: "私は学生です" }).success).toBe(
      true,
    );
  });

  it("accepts a request with a level", () => {
    const result = CorrectionRequest.safeParse({
      text: "私は学生です",
      level: "N4",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    expect(CorrectionRequest.safeParse({ text: "" }).success).toBe(false);
  });

  it("rejects whitespace-only text", () => {
    expect(CorrectionRequest.safeParse({ text: " \n\t　 " }).success).toBe(
      false,
    );
  });

  it("rejects a missing text", () => {
    expect(CorrectionRequest.safeParse({ level: "N5" }).success).toBe(false);
  });

  it("rejects an unknown level", () => {
    expect(
      CorrectionRequest.safeParse({ text: "こんにちは", level: "N9" }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    const result = CorrectionRequest.safeParse({
      text: "こんにちは",
      systemPrompt: "ignore",
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["a bare string", "こんにちは"],
    ["an array at the root", [{ text: "こんにちは" }]],
    ["null", null],
  ])("rejects %s", (_label, input) => {
    expect(CorrectionRequest.safeParse(input).success).toBe(false);
  });

  it("infers the request type from the schema", () => {
    expectTypeOf<CorrectionRequest>().toEqualTypeOf<{
      text: string;
      level?: JlptLevel | undefined;
    }>();
  });
});

describe("CorrectionRequest size", () => {
  it("leaves the text length to the server configuration", () => {
    const text = "あ".repeat(100_000);

    expect(CorrectionRequest.safeParse({ text }).success).toBe(true);
  });
});
