import { describe, expect, expectTypeOf, it } from "vitest";
import { MAX_EDITS } from "../src/constants.js";
import { CorrectionResponse } from "../src/correction-response.js";
import type { Edit } from "../src/edit.js";

const validEdit = {
  start: 0,
  end: 3,
  replacement: "私は",
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

  it("accepts exactly MAX_EDITS edits", () => {
    const edits = Array.from({ length: MAX_EDITS }, () => validEdit);

    expect(CorrectionResponse.safeParse({ edits }).success).toBe(true);
  });

  it("rejects more than MAX_EDITS edits", () => {
    const edits = Array.from({ length: MAX_EDITS + 1 }, () => validEdit);

    expect(CorrectionResponse.safeParse({ edits }).success).toBe(false);
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
