import { z } from "zod";

export const ERROR_TYPES_BY_GROUP = {
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
} as const;

export const ErrorType = z.enum([
  ...ERROR_TYPES_BY_GROUP.orthography,
  ...ERROR_TYPES_BY_GROUP.grammar_and_syntax,
  ...ERROR_TYPES_BY_GROUP.lexicon_and_semantics,
  ...ERROR_TYPES_BY_GROUP.register_and_politeness,
  ...ERROR_TYPES_BY_GROUP.discourse_and_style,
]);
export type ErrorType = z.infer<typeof ErrorType>;
