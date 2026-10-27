import { describe, expect, expectTypeOf, it } from "vitest";
import { ErrorType } from "../src/error-type.js";

const expectedErrorTypes = [
  "particles",
  "conjunctions_affixes",
  "verb_conjugation_compounds",
  "giving_receiving",
  "keigo_politeness",
  "conditionals",
  "obligation_permission_prohibition",
  "desire_intent_plans",
  "conjecture_judgment_appearance",
  "comparison_degree_limitation",
  "time_situation_aspect",
  "reason_cause_concession",
  "orthography",
  "adjective_conjugation",
  "word_order",
  "counters",
  "transitivity",
  "vocabulary_word_choice",
  "style_and_discourse",
  "punctuation",
  "other",
] as const;

describe("ErrorType", () => {
  it("lists exactly the expected categories", () => {
    expect([...ErrorType.options].sort()).toEqual(
      [...expectedErrorTypes].sort(),
    );
  });

  it.each(expectedErrorTypes)("accepts %s", (errorType) => {
    expect(ErrorType.safeParse(errorType).success).toBe(true);
  });

  it.each([
    "unknown_category",
    "Other",
    "particle",
    "Particles",
    "word-order",
    "",
    " particles",
    "ni_particle",
  ])("rejects unknown category %j", (errorType) => {
    expect(ErrorType.safeParse(errorType).success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(ErrorType.safeParse(1).success).toBe(false);
  });

  it("infers the union of the categories", () => {
    expectTypeOf<ErrorType>().toEqualTypeOf<
      (typeof expectedErrorTypes)[number]
    >();
  });
});
