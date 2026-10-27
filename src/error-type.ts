import { z } from "zod";

export const ErrorType = z.enum([
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
]);
export type ErrorType = z.infer<typeof ErrorType>;
