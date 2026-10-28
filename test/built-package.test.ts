import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const distUrl = new URL("../dist/index.js", import.meta.url);
const typesUrl = new URL("../dist/index.d.ts", import.meta.url);

describe("built package", () => {
  it("exports every public name from the JavaScript entry point", async () => {
    const api = await import(distUrl.href);

    expect(Object.keys(api).sort()).toEqual(
      [
        "API_VERSION",
        "ApiError",
        "ApiErrorCode",
        "CapabilitiesResponse",
        "CorrectionRequest",
        "CorrectionResponse",
        "Edit",
        "ErrorType",
        "Id",
        "IsoDateTime",
        "LanguageCapabilities",
        "LanguageCode",
        "Level",
        "LimitsResponse",
        "Page",
        "UserProfile",
      ].sort(),
    );
  });

  it("validates input through the built schemas", async () => {
    const { CorrectionRequest } = await import(distUrl.href);

    expect(CorrectionRequest.safeParse({ text: "こんにちは" }).success).toBe(
      true,
    );
  });

  it("declares every public type in the declaration file", () => {
    const declarations = readFileSync(typesUrl, "utf8");

    for (const name of [
      "ApiError",
      "ApiErrorCode",
      "CapabilitiesResponse",
      "CorrectionRequest",
      "CorrectionResponse",
      "Edit",
      "Id",
      "IsoDateTime",
      "Level",
      "Page",
      "UserProfile",
    ]) {
      expect(declarations).toMatch(new RegExp(`type ${name}\\b`));
    }
  });

  it("keeps zod external instead of bundling it", () => {
    const bundle = readFileSync(distUrl, "utf8");

    expect(bundle).toMatch(/from ["']zod["']/);
    expect(bundle.length).toBeLessThan(10_000);
  });
});
