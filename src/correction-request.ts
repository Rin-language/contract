import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";

/** What a client sends to have a text corrected. */
export const CorrectionRequest = z
  .strictObject({
    text: z
      .string()
      .refine((text) => text.trim().length > 0, "text must not be blank")
      .meta({
        description:
          "The text to correct. Must not be blank: at least one character that is not whitespace after trim(). The text is never trimmed or altered. Its maximum length is a server limit (see LimitsResponse), not checked here.",
      }),
    language: LanguageCode.optional().meta({
      description:
        "Language of the text. When omitted, the server uses the targetLanguage of the user profile. null is rejected.",
    }),
    level: Level.optional().meta({
      description:
        "The learner's level, in the scale of the language (for example N4 or B1). Omit the key to let the server decide. null is rejected.",
    }),
  })
  .meta({
    description:
      "What a client sends to have a text corrected. Unknown keys are rejected.",
    examples: [
      { text: "学校で行きます", language: "ja", level: "N5" },
      {
        text: "Je suis allé à l'école hier soir.",
        language: "fr",
        level: "B1",
      },
      { text: "こんにちは" },
    ],
  });
/** What a client sends to have a text corrected. */
export type CorrectionRequest = z.infer<typeof CorrectionRequest>;
