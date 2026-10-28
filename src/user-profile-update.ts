import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";

// What a client sends to change its profile: only the changed fields. Built
// field by field rather than from UserProfile, so it has no skillRatings (the
// server computes them) and no default (an absent key must change nothing).
export const UserProfileUpdate = z
  .strictObject({
    displayName: NonBlankString.optional(),
    targetLanguage: LanguageCode.optional(),
    uiLanguage: LanguageCode.optional(),
    timezone: NonBlankString.optional(),
    declaredLevel: Level.optional(),
  })
  .refine(
    (update) => Object.keys(update).length > 0,
    "an update must change at least one field",
  );
export type UserProfileUpdate = z.infer<typeof UserProfileUpdate>;
