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
const validResponse = { edits: [validEdit], score: 80 };

describe("CorrectionResponse", () => {
  it("accepts a response with one edit", () => {
    expect(CorrectionResponse.safeParse(validResponse).success).toBe(true);
  });

  it("accepts a response with no edit", () => {
    expect(
      CorrectionResponse.safeParse({ edits: [], score: 100 }).success,
    ).toBe(true);
  });

  it("rejects a response with an invalid edit", () => {
    const edits = [validEdit, { ...validEdit, start: 5, end: 1 }];

    expect(
      CorrectionResponse.safeParse({ ...validResponse, edits }).success,
    ).toBe(false);
  });

  it("rejects a missing edits key", () => {
    expect(CorrectionResponse.safeParse({ score: 80 }).success).toBe(false);
  });

  it("rejects a missing score", () => {
    expect(CorrectionResponse.safeParse({ edits: [validEdit] }).success).toBe(
      false,
    );
  });

  it.each([0, 1, 50, 100])("accepts the score %i", (score) => {
    expect(CorrectionResponse.safeParse({ edits: [], score }).success).toBe(
      true,
    );
  });

  it.each([-1, 101, 50.5, Number.NaN, Number.POSITIVE_INFINITY, "80", null])(
    "rejects the score %j",
    (score) => {
      expect(CorrectionResponse.safeParse({ edits: [], score }).success).toBe(
        false,
      );
    },
  );

  it("rejects an unknown key next to edits", () => {
    expect(
      CorrectionResponse.safeParse({ ...validResponse, note: "hi" }).success,
    ).toBe(false);
  });

  it.each([
    ["free text", "Sure! Here is the corrected text: 私は学生です"],
    [
      "an object of a different shape",
      { corrected: "私は学生です", score: 90 },
    ],
    ["an array at the root", [validEdit]],
    ["edits that is not an array", { edits: validEdit, score: 80 }],
    ["null", null],
  ])("rejects injected output: %s", (_label, output) => {
    expect(CorrectionResponse.safeParse(output).success).toBe(false);
  });

  it("infers the response type from the schema", () => {
    expectTypeOf<CorrectionResponse>().toEqualTypeOf<{
      edits: Edit[];
      score: number;
    }>();
  });
});

describe("CorrectionResponse size", () => {
  it("leaves the number of edits to the server configuration", () => {
    const edits = Array.from({ length: 1000 }, (_, index) => ({
      ...validEdit,
      start: index,
      end: index,
    }));

    expect(CorrectionResponse.safeParse({ edits, score: 50 }).success).toBe(
      true,
    );
  });
});

describe("CorrectionResponse edit order", () => {
  const editAt = (start: number, end: number) => ({ ...validEdit, start, end });
  const parse = (edits: unknown[]) =>
    CorrectionResponse.safeParse({ edits, score: 50 }).success;

  it("accepts edits sorted by position", () => {
    expect(parse([editAt(0, 2), editAt(5, 8)])).toBe(true);
  });

  it("accepts an edit that starts where the previous one ends", () => {
    expect(parse([editAt(0, 3), editAt(3, 6)])).toBe(true);
  });

  it("accepts an insertion at the end of the previous edit", () => {
    expect(parse([editAt(0, 3), editAt(3, 3)])).toBe(true);
  });

  it("rejects overlapping edits", () => {
    expect(parse([editAt(0, 5), editAt(3, 8)])).toBe(false);
  });

  it("rejects an insertion inside a replaced span", () => {
    expect(parse([editAt(0, 5), editAt(2, 2)])).toBe(false);
  });

  it("rejects the same edit twice", () => {
    expect(parse([editAt(0, 3), editAt(0, 3)])).toBe(false);
  });

  it("rejects edits not sorted by position", () => {
    expect(parse([editAt(5, 8), editAt(0, 2)])).toBe(false);
  });
});
