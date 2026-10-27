import { describe, expect, expectTypeOf, it } from "vitest";
import { CorrectionResponse } from "../src/correction-response.js";
import type { Edit } from "../src/edit.js";

const validEdit = {
  start: 0,
  end: 3,
  replacement: "私は",
  errorType: "particle_wrong_choice",
  explanation: "Particle fix.",
};

describe("CorrectionResponse", () => {
  it("accepts a response with one edit", () => {
    expect(CorrectionResponse.safeParse({ edits: [validEdit] }).success).toBe(
      true,
    );
  });

  it("accepts a response with no edit", () => {
    expect(CorrectionResponse.safeParse({ edits: [] }).success).toBe(true);
  });

  it("rejects a response with an invalid edit", () => {
    const edits = [validEdit, { ...validEdit, start: 5, end: 1 }];

    expect(CorrectionResponse.safeParse({ edits }).success).toBe(false);
  });

  it("rejects a missing edits key", () => {
    expect(CorrectionResponse.safeParse({}).success).toBe(false);
  });

  it("rejects an unknown key next to edits", () => {
    expect(
      CorrectionResponse.safeParse({ edits: [], note: "hi" }).success,
    ).toBe(false);
  });

  it.each([
    ["free text", "Sure! Here is the corrected text: 私は学生です"],
    [
      "an object of a different shape",
      { corrected: "私は学生です", score: 0.9 },
    ],
    ["an array at the root", [validEdit]],
    ["edits that is not an array", { edits: validEdit }],
    ["null", null],
  ])("rejects injected output: %s", (_label, output) => {
    expect(CorrectionResponse.safeParse(output).success).toBe(false);
  });

  it("infers the response type from the schema", () => {
    expectTypeOf<CorrectionResponse>().toEqualTypeOf<{ edits: Edit[] }>();
  });
});

describe("CorrectionResponse size", () => {
  it("leaves the number of edits to the server configuration", () => {
    const edits = Array.from({ length: 1000 }, (_, index) => ({
      ...validEdit,
      start: index,
      end: index,
    }));

    expect(CorrectionResponse.safeParse({ edits }).success).toBe(true);
  });
});
