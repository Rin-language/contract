import { describe, expect, expectTypeOf, it } from "vitest";
import {
  CapabilitiesResponse,
  LanguageCapabilities,
} from "../src/capabilities-response.js";

const japanese = {
  code: "ja",
  errorTypes: ["particles", "other"],
  levels: ["N5", "N4", "N3", "N2", "N1"],
  skills: ["reading", "listening", "writing", "speaking"],
};
const french = {
  code: "fr",
  errorTypes: ["agreement", "other"],
  levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
  skills: ["reading", "writing"],
};

describe("CapabilitiesResponse", () => {
  it("accepts a single language", () => {
    expect(
      CapabilitiesResponse.safeParse({ languages: [japanese] }).success,
    ).toBe(true);
  });

  it("accepts several languages, each with its own scale", () => {
    expect(
      CapabilitiesResponse.safeParse({ languages: [japanese, french] }).success,
    ).toBe(true);
  });

  it("keeps the order of the levels", () => {
    const parsed = CapabilitiesResponse.parse({ languages: [japanese] });

    expect(parsed.languages[0]?.levels).toEqual(japanese.levels);
  });

  it("rejects a server with no language", () => {
    expect(CapabilitiesResponse.safeParse({ languages: [] }).success).toBe(
      false,
    );
  });

  it("rejects two entries for the same language", () => {
    expect(
      CapabilitiesResponse.safeParse({ languages: [japanese, japanese] })
        .success,
    ).toBe(false);
  });

  it("rejects a missing languages key", () => {
    expect(CapabilitiesResponse.safeParse({}).success).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      CapabilitiesResponse.safeParse({ languages: [japanese], plan: "pro" })
        .success,
    ).toBe(false);
  });

  it("infers the response type from the schema", () => {
    expectTypeOf<CapabilitiesResponse>().toEqualTypeOf<{
      languages: LanguageCapabilities[];
    }>();
  });
});

describe("LanguageCapabilities", () => {
  it("accepts a valid language", () => {
    expect(LanguageCapabilities.safeParse(japanese).success).toBe(true);
  });

  it.each(["zh-CN", "JA", ""])("rejects the malformed code %j", (code) => {
    expect(LanguageCapabilities.safeParse({ ...japanese, code }).success).toBe(
      false,
    );
  });

  it("rejects an empty list of error types", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, errorTypes: [] }).success,
    ).toBe(false);
  });

  it("rejects a duplicated error type", () => {
    expect(
      LanguageCapabilities.safeParse({
        ...japanese,
        errorTypes: ["particles", "particles"],
      }).success,
    ).toBe(false);
  });

  it("rejects a blank error type", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, errorTypes: [" "] })
        .success,
    ).toBe(false);
  });

  it("rejects an empty list of levels", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, levels: [] }).success,
    ).toBe(false);
  });

  it("rejects a duplicated level", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, levels: ["N5", "N5"] })
        .success,
    ).toBe(false);
  });

  it("rejects an empty list of skills", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, skills: [] }).success,
    ).toBe(false);
  });

  it("rejects a duplicated skill", () => {
    expect(
      LanguageCapabilities.safeParse({
        ...japanese,
        skills: ["reading", "reading"],
      }).success,
    ).toBe(false);
  });

  it("rejects a blank skill", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, skills: ["  "] }).success,
    ).toBe(false);
  });

  it.each(["code", "errorTypes", "levels", "skills"])(
    "rejects a missing %s",
    (key) => {
      const { [key]: _removed, ...rest } = japanese as Record<string, unknown>;

      expect(LanguageCapabilities.safeParse(rest).success).toBe(false);
    },
  );

  it("rejects an unknown key", () => {
    expect(
      LanguageCapabilities.safeParse({ ...japanese, label: "Japanese" })
        .success,
    ).toBe(false);
  });
});
