import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { NonBlankString } from "./non-blank-string.js";

/** A rating of the user for one skill of one language. Computed by the server only. */
export const SkillRating = z
  .strictObject({
    language: LanguageCode.meta({ description: "The rated language." }),
    skill: NonBlankString.meta({
      description:
        "The rated skill, such as reading or listening. Non-blank string, one of the skills of that language in CapabilitiesResponse (checked by the server).",
    }),
    rating: z.number().meta({
      description:
        "The rating. A finite number (Infinity and NaN are rejected). Its scale belongs to the server.",
    }),
    votes: z.number().int().nonnegative().meta({
      description:
        "How many results the rating is based on. Integer, zero or more.",
    }),
  })
  .meta({
    description:
      "A rating of the user for one skill of one language. Read-only: computed by the server only. Unknown keys are rejected.",
    examples: [{ language: "ja", skill: "reading", rating: 1320, votes: 8 }],
  });
/** A rating of the user for one skill of one language. */
export type SkillRating = z.infer<typeof SkillRating>;
