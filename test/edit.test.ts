import { describe, expect, expectTypeOf, it } from "vitest";
import { Edit } from "../src/edit.js";

const validEdit = {
  start: 0,
  end: 3,
  replacement: "私は",
  errorType: "particle",
  explanation: "Particle fix.",
};

describe("Edit", () => {
  it("accepts a valid edit", () => {
    expect(Edit.safeParse(validEdit).success).toBe(true);
  });

  it("accepts an insertion where start equals end", () => {
    expect(Edit.safeParse({ ...validEdit, start: 2, end: 2 }).success).toBe(
      true,
    );
  });

  it("accepts a deletion with an empty replacement", () => {
    expect(Edit.safeParse({ ...validEdit, replacement: "" }).success).toBe(
      true,
    );
  });

  it("rejects start greater than end", () => {
    expect(Edit.safeParse({ ...validEdit, start: 4, end: 3 }).success).toBe(
      false,
    );
  });

  it("rejects a negative start", () => {
    expect(Edit.safeParse({ ...validEdit, start: -1 }).success).toBe(false);
  });

  it("rejects a negative end", () => {
    expect(Edit.safeParse({ ...validEdit, start: 0, end: -1 }).success).toBe(
      false,
    );
  });

  it("rejects a non-integer start", () => {
    expect(Edit.safeParse({ ...validEdit, start: 0.5 }).success).toBe(false);
  });

  it("rejects a non-integer end", () => {
    expect(Edit.safeParse({ ...validEdit, end: 2.5 }).success).toBe(false);
  });

  it("rejects an empty explanation", () => {
    expect(Edit.safeParse({ ...validEdit, explanation: "" }).success).toBe(
      false,
    );
  });

  it("rejects a missing replacement", () => {
    const { replacement: _replacement, ...withoutReplacement } = validEdit;

    expect(Edit.safeParse(withoutReplacement).success).toBe(false);
  });

  it("rejects a missing error type", () => {
    const { errorType: _errorType, ...withoutErrorType } = validEdit;

    expect(Edit.safeParse(withoutErrorType).success).toBe(false);
  });

  it.each(["particle", "prohibition_permission", "new_catalog_category"])(
    "accepts the catalog category %s as error type",
    (errorType) => {
      expect(Edit.safeParse({ ...validEdit, errorType }).success).toBe(true);
    },
  );

  it("rejects an empty error type", () => {
    expect(Edit.safeParse({ ...validEdit, errorType: "" }).success).toBe(false);
  });

  it("rejects a non-string error type", () => {
    expect(Edit.safeParse({ ...validEdit, errorType: 3 }).success).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(Edit.safeParse({ ...validEdit, severity: "high" }).success).toBe(
      false,
    );
  });

  it("infers the edit type from the schema", () => {
    expectTypeOf<Edit>().toEqualTypeOf<{
      start: number;
      end: number;
      replacement: string;
      errorType: string;
      explanation: string;
    }>();
  });
});

describe("Edit size", () => {
  it("leaves the explanation length to the server configuration", () => {
    const explanation = "a".repeat(100_000);

    expect(Edit.safeParse({ ...validEdit, explanation }).success).toBe(true);
  });
});
