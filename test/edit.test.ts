import { describe, expect, expectTypeOf, it } from "vitest";
import { Edit } from "../src/edit.js";
import type { ErrorType } from "../src/error-type.js";
import type { JlptLevel } from "../src/jlpt-level.js";

const validEdit = {
  start: 0,
  end: 3,
  replacement: "私は",
  errorType: "particles",
  jlptLevel: "N5",
  grammarPointId: "ni_particle",
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

  it("rejects a whitespace-only explanation", () => {
    expect(
      Edit.safeParse({ ...validEdit, explanation: " \n\t　 " }).success,
    ).toBe(false);
  });

  it("rejects a missing replacement", () => {
    const { replacement: _replacement, ...withoutReplacement } = validEdit;

    expect(Edit.safeParse(withoutReplacement).success).toBe(false);
  });

  it("rejects a missing error type", () => {
    const { errorType: _errorType, ...withoutErrorType } = validEdit;

    expect(Edit.safeParse(withoutErrorType).success).toBe(false);
  });

  it.each(["particles", "keigo_politeness", "orthography", "other"])(
    "accepts the category %s as error type",
    (errorType) => {
      expect(Edit.safeParse({ ...validEdit, errorType }).success).toBe(true);
    },
  );

  it("rejects an empty error type", () => {
    expect(Edit.safeParse({ ...validEdit, errorType: "" }).success).toBe(false);
  });

  it("rejects an unknown error type", () => {
    expect(
      Edit.safeParse({ ...validEdit, errorType: "unknown_category" }).success,
    ).toBe(false);
  });

  it("rejects a non-string error type", () => {
    expect(Edit.safeParse({ ...validEdit, errorType: 3 }).success).toBe(false);
  });

  it.each(["N5", "N4", "N3", "N2", "N1"])(
    "accepts the level %s",
    (jlptLevel) => {
      expect(Edit.safeParse({ ...validEdit, jlptLevel }).success).toBe(true);
    },
  );

  it("rejects an unknown level", () => {
    expect(Edit.safeParse({ ...validEdit, jlptLevel: "N6" }).success).toBe(
      false,
    );
  });

  it("rejects a missing level", () => {
    const { jlptLevel: _jlptLevel, ...withoutLevel } = validEdit;

    expect(Edit.safeParse(withoutLevel).success).toBe(false);
  });

  it("accepts a null grammar point when the catalog has no match", () => {
    expect(Edit.safeParse({ ...validEdit, grammarPointId: null }).success).toBe(
      true,
    );
  });

  it("rejects an empty grammar point id", () => {
    expect(Edit.safeParse({ ...validEdit, grammarPointId: "" }).success).toBe(
      false,
    );
  });

  it("rejects a missing grammar point id", () => {
    const { grammarPointId: _grammarPointId, ...withoutGrammarPoint } =
      validEdit;

    expect(Edit.safeParse(withoutGrammarPoint).success).toBe(false);
  });

  it("rejects a non-string grammar point id", () => {
    expect(Edit.safeParse({ ...validEdit, grammarPointId: 7 }).success).toBe(
      false,
    );
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
      errorType: ErrorType;
      jlptLevel: JlptLevel;
      grammarPointId: string | null;
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
