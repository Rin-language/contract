import { z } from "zod";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";
import { NonBlankString } from "./non-blank-string.js";
import { SkillRating } from "./skill-rating.js";

/**
 * What the server returns for a user profile. Never validate a client request
 * with it (its defaults would reset stored values): use `UserProfileUpdate`.
 */
export const UserProfile = z
  .strictObject({
    displayName: NonBlankString.meta({
      description: "The name shown to the user. Free text, non-blank.",
    }),
    targetLanguage: LanguageCode.default("ja").meta({
      description:
        "The language being learned. Defaults to ja when omitted, so a parsed profile always has it.",
    }),
    uiLanguage: LanguageCode.meta({
      description: "Language of the interface.",
    }),
    timezone: NonBlankString.meta({
      description:
        "IANA time zone name of the user, such as Asia/Bangkok. Non-blank. Whether it is a valid IANA name is checked by the server, which owns the runtime.",
    }),
    // Always set: the server starts it at the lowest level of targetLanguage's
    // scale, and the user changes it during onboarding.
    declaredLevel: Level.meta({
      description:
        "The level the user says they have, in the scale of targetLanguage. Always set: until the user declares one, the server sets the lowest level of the language (the first of its levels in CapabilitiesResponse), and the user changes it during onboarding. null is rejected.",
    }),
    // The default keeps a profile without ratings valid.
    skillRatings: z.array(SkillRating).default([]).meta({
      description:
        "Read-only: the user's ratings, computed by the server. Defaults to an empty array, so a parsed profile always has it. A client never sends it: changes go through UserProfileUpdate, which has no such field.",
    }),
  })
  .meta({
    description:
      "What the server returns for a user profile. Never use it to validate a client request: its skillRatings default would turn a missing field into an empty array and wipe the stored ratings, and its targetLanguage default would reset the language to ja. Unknown keys are rejected.",
    examples: [
      {
        displayName: "Robis",
        targetLanguage: "ja",
        uiLanguage: "fr",
        timezone: "Asia/Bangkok",
        declaredLevel: "N4",
        skillRatings: [
          { language: "ja", skill: "reading", rating: 1320, votes: 8 },
        ],
      },
    ],
  });
/** What the server returns for a user profile. */
export type UserProfile = z.infer<typeof UserProfile>;
