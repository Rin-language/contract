import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { NonBlankString } from "./non-blank-string.js";

// Computed by the server only. The valid skills of a language are published
// through CapabilitiesResponse.
export const SkillRating = z.strictObject({
  language: LanguageCode,
  skill: NonBlankString,
  rating: z.number(),
  votes: z.number().int().nonnegative(),
});
export type SkillRating = z.infer<typeof SkillRating>;
