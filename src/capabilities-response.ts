import { z } from "zod";
import { ErrorType } from "./error-type.js";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";

const hasNoDuplicate = (values: readonly string[]) =>
  new Set(values).size === values.length;

/** What the server offers for one language: its error types, its ordered levels and its skills. */
export const LanguageCapabilities = z
  .strictObject({
    code: LanguageCode.meta({ description: "The language described." }),
    errorTypes: z
      .array(ErrorType)
      .min(1)
      .refine(hasNoDuplicate, "error types must be unique")
      .meta({
        description:
          "The error type ids the server can return in Edit.errorType for this language. At least one, no duplicates. Only ids are published: display labels are translated by the client.",
      }),
    levels: z
      .array(Level)
      .min(1)
      .refine(hasNoDuplicate, "levels must be unique")
      .meta({
        description:
          "The level scale of the language, ordered from the lowest level to the highest (N5 to N1, A1 to C2). The order is meaningful. At least one, no duplicates.",
      }),
    skills: z
      .array(NonBlankString)
      .min(1)
      .refine(hasNoDuplicate, "skills must be unique")
      .meta({
        description:
          "The skills rated for this language, such as reading or listening: the valid values of SkillRating.skill. At least one, no duplicates, none blank.",
      }),
  })
  .meta({
    description:
      "What the server offers for one language. Unknown keys are rejected.",
    examples: [
      {
        code: "ja",
        errorTypes: ["particles", "keigo_politeness", "other"],
        levels: ["N5", "N4", "N3", "N2", "N1"],
        skills: ["reading", "listening", "writing", "speaking"],
      },
    ],
  });
/** What the server offers for one language. */
export type LanguageCapabilities = z.infer<typeof LanguageCapabilities>;

/** Body of `GET /v1/capabilities`: the languages the server offers, so a client hardcodes no label or picker. */
export const CapabilitiesResponse = z
  .strictObject({
    languages: z
      .array(LanguageCapabilities)
      .min(1)
      .refine(
        (languages) =>
          hasNoDuplicate(languages.map((language) => language.code)),
        "languages must be unique",
      )
      .meta({
        description:
          "The languages the server has a profile for. At least one, and no two entries with the same code.",
      }),
  })
  .meta({
    description:
      "Body of GET /v1/capabilities: what the server can do, so a client shows labels and pickers without hardcoding anything. Unknown keys are rejected.",
    examples: [
      {
        languages: [
          {
            code: "ja",
            errorTypes: ["particles", "keigo_politeness", "other"],
            levels: ["N5", "N4", "N3", "N2", "N1"],
            skills: ["reading", "listening", "writing", "speaking"],
          },
          {
            code: "fr",
            errorTypes: ["agreement", "verb_tense", "other"],
            levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
            skills: ["reading", "writing"],
          },
        ],
      },
    ],
  });
/** Body of `GET /v1/capabilities`. */
export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponse>;
