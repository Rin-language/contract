import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";

// Built field by field rather than from UserProfile, so it has no skillRatings
// (the server computes them) and no default (an absent key must change nothing).
/** What a client sends to change its profile: only the changed fields. */
export const UserProfileUpdate = z
  .strictObject({
    displayName: NonBlankString.optional().meta({
      description: "The new name shown to the user. Non-blank.",
    }),
    targetLanguage: LanguageCode.optional().meta({
      description:
        "The new language being learned. No default: an absent key leaves the target language unchanged. When present, declaredLevel is required.",
    }),
    uiLanguage: LanguageCode.optional().meta({
      description: "The new language of the interface.",
    }),
    timezone: NonBlankString.optional().meta({
      description:
        "The new IANA time zone name, such as Asia/Tokyo. Non-blank. The IANA name is checked by the server.",
    }),
    declaredLevel: Level.optional().meta({
      description:
        "The new declared level, in the scale of the target language after the update. Required when targetLanguage is sent.",
    }),
  })
  .refine(
    (update) => Object.keys(update).length > 0,
    "an update must change at least one field",
  )
  // A level only makes sense in the scale of its language, so a new target
  // language comes with its level (the lowest of the scale when unknown).
  .refine(
    (update) =>
      update.targetLanguage === undefined || update.declaredLevel !== undefined,
    {
      message: "a change of target language must come with its declared level",
      path: ["declaredLevel"],
    },
  )
  .meta({
    description:
      "What a client sends to change its profile. It carries only the fields that change: the server leaves every other field as it is. Rules that JSON Schema cannot express: at least one field is required (an empty update is rejected), and a change of targetLanguage must come with its declaredLevel (the lowest level of the new language when the user does not know theirs yet). null is rejected everywhere: a field cannot be cleared, only changed. There is no skillRatings field, so ratings sent by a client are rejected. Unknown keys are rejected.",
    examples: [
      { targetLanguage: "fr", declaredLevel: "A1" },
      { timezone: "Asia/Tokyo" },
    ],
  });
/** What a client sends to change its profile. */
export type UserProfileUpdate = z.infer<typeof UserProfileUpdate>;
