import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";

export const CorrectionRequest = z.strictObject({
  text: z
    .string()
    .refine((text) => text.trim().length > 0, "text must not be blank"),
  // When absent, the server uses the target language of the user profile.
  language: LanguageCode.optional(),
  level: Level.optional(),
});
export type CorrectionRequest = z.infer<typeof CorrectionRequest>;
