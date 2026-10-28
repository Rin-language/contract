import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";

export const UserProfile = z.strictObject({
  displayName: NonBlankString,
  targetLanguage: LanguageCode.default("ja"),
  uiLanguage: LanguageCode,
  // Whether it is a valid IANA name is checked by the server, which owns the runtime.
  timezone: NonBlankString,
  // Absent until the user declares it; its scale depends on targetLanguage.
  declaredLevel: Level.optional(),
});
export type UserProfile = z.infer<typeof UserProfile>;
