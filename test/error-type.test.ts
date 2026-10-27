import { describe, expect, expectTypeOf, it } from "vitest";
import { ERROR_TYPES_BY_GROUP, ErrorType } from "../src/error-type.js";

const expectedGroups = {
  orthography: [
    "kanji_wrong_character",
    "kanji_homophone_confusion",
    "okurigana_error",
    "kana_confusion_visual",
    "long_vowel_omission_or_addition",
    "geminate_consonant_error",
  ],
  grammar_and_syntax: [
    "particle_wrong_choice",
    "particle_missing",
    "particle_unnecessary",
    "verb_conjugation_error",
    "adjective_conjugation_error",
    "word_order_error",
    "tense_aspect_mismatch",
    "counter_word_mismatch",
  ],
  lexicon_and_semantics: [
    "unnatural_collocation",
    "transitivity_confusion",
    "literal_translation_error",
    "false_friend_usage",
  ],
  register_and_politeness: [
    "keigo_self_exaltation",
    "keigo_other_deprecation",
    "register_inconsistency",
    "inappropriate_formality_level",
  ],
  discourse_and_style: [
    "pronoun_overuse",
    "redundant_repetition",
    "abrupt_sentence_ending",
    "punctuation_error",
  ],
};

describe("ERROR_TYPES_BY_GROUP", () => {
  it("lists the five groups with their error types", () => {
    expect(ERROR_TYPES_BY_GROUP).toEqual(expectedGroups);
  });
});

describe("ErrorType", () => {
  it.each(Object.values(expectedGroups).flat())("accepts %s", (errorType) => {
    expect(ErrorType.safeParse(errorType).success).toBe(true);
  });

  it.each([
    "other",
    "particle",
    "ParticleMissing",
    "particle-missing",
    "",
    " particle_missing",
  ])("rejects unknown error type %j", (errorType) => {
    expect(ErrorType.safeParse(errorType).success).toBe(false);
  });

  it("rejects a group name used as an error type", () => {
    expect(ErrorType.safeParse("orthography").success).toBe(false);
  });

  it("rejects a non-string value", () => {
    expect(ErrorType.safeParse(1).success).toBe(false);
  });

  it("infers the union of every listed error type", () => {
    type Listed =
      (typeof ERROR_TYPES_BY_GROUP)[keyof typeof ERROR_TYPES_BY_GROUP][number];

    expectTypeOf<ErrorType>().toEqualTypeOf<Listed>();
  });
});
