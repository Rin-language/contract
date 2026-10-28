import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";
import { SkillRating } from "./skill-rating.js";

export const UserProfile = z.strictObject({
  displayName: NonBlankString,
  targetLanguage: LanguageCode.default("ja"),
  uiLanguage: LanguageCode,
  // Whether it is a valid IANA name is checked by the server, which owns the runtime.
  timezone: NonBlankString,
  // Always set: the server starts it at the lowest level of targetLanguage's
  // scale, and the user changes it during onboarding.
  declaredLevel: Level,
  // Read-only: computed by the server. Clients send UserProfileUpdate, which
  // has no such field. The default keeps a profile without ratings valid.
  skillRatings: z.array(SkillRating).default([]),
});
export type UserProfile = z.infer<typeof UserProfile>;
