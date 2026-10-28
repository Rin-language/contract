import { describe, expect, expectTypeOf, it } from "vitest";
import type { SkillRating } from "../src/skill-rating.js";
import { UserProfile } from "../src/user-profile.js";

const validProfile = {
  displayName: "Robis",
  targetLanguage: "ja",
  uiLanguage: "fr",
  timezone: "Asia/Bangkok",
  declaredLevel: "N4",
};

describe("UserProfile", () => {
  it("accepts a complete profile", () => {
    expect(UserProfile.safeParse(validProfile).success).toBe(true);
  });

  it("rejects a profile without a declared level", () => {
    const { declaredLevel: _declaredLevel, ...withoutLevel } = validProfile;

    expect(UserProfile.safeParse(withoutLevel).success).toBe(false);
  });

  it("accepts a declared level from another scale", () => {
    expect(
      UserProfile.safeParse({
        ...validProfile,
        targetLanguage: "fr",
        declaredLevel: "B2",
      }).success,
    ).toBe(true);
  });

  it("defaults the target language to Japanese", () => {
    const { targetLanguage: _targetLanguage, ...withoutTarget } = validProfile;

    expect(UserProfile.parse(withoutTarget).targetLanguage).toBe("ja");
  });

  it("keeps an explicit target language", () => {
    expect(
      UserProfile.parse({ ...validProfile, targetLanguage: "zh" })
        .targetLanguage,
    ).toBe("zh");
  });

  it.each(["zh-CN", "JA", ""])(
    "rejects the malformed target language %j",
    (targetLanguage) => {
      expect(
        UserProfile.safeParse({ ...validProfile, targetLanguage }).success,
      ).toBe(false);
    },
  );

  it.each(["en-US", "FR", ""])(
    "rejects the malformed interface language %j",
    (uiLanguage) => {
      expect(
        UserProfile.safeParse({ ...validProfile, uiLanguage }).success,
      ).toBe(false);
    },
  );

  it("rejects a missing interface language", () => {
    const { uiLanguage: _uiLanguage, ...withoutUi } = validProfile;

    expect(UserProfile.safeParse(withoutUi).success).toBe(false);
  });

  it.each(["displayName", "timezone"])("rejects a blank %s", (key) => {
    expect(
      UserProfile.safeParse({ ...validProfile, [key]: "  " }).success,
    ).toBe(false);
  });

  it.each(["displayName", "timezone"])("rejects a missing %s", (key) => {
    const { [key]: _removed, ...rest } = validProfile as Record<
      string,
      unknown
    >;

    expect(UserProfile.safeParse(rest).success).toBe(false);
  });

  it("leaves the check of the time zone name to the server", () => {
    expect(
      UserProfile.safeParse({ ...validProfile, timezone: "Not/AZone" }).success,
    ).toBe(true);
  });

  it("rejects an empty declared level", () => {
    expect(
      UserProfile.safeParse({ ...validProfile, declaredLevel: "" }).success,
    ).toBe(false);
  });

  it("rejects a null declared level", () => {
    expect(
      UserProfile.safeParse({ ...validProfile, declaredLevel: null }).success,
    ).toBe(false);
  });

  it("defaults the skill ratings to an empty list", () => {
    expect(UserProfile.parse(validProfile).skillRatings).toEqual([]);
  });

  it("keeps the skill ratings sent by the server", () => {
    const skillRatings = [
      { language: "ja", skill: "reading", rating: 1320, votes: 8 },
      { language: "ja", skill: "listening", rating: 1180, votes: 0 },
    ];

    expect(
      UserProfile.parse({ ...validProfile, skillRatings }).skillRatings,
    ).toEqual(skillRatings);
  });

  it("rejects a malformed skill rating", () => {
    expect(
      UserProfile.safeParse({
        ...validProfile,
        skillRatings: [{ language: "ja", skill: "reading", rating: 1300 }],
      }).success,
    ).toBe(false);
  });

  it("rejects a null list of skill ratings", () => {
    expect(
      UserProfile.safeParse({ ...validProfile, skillRatings: null }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      UserProfile.safeParse({ ...validProfile, email: "a@b.c" }).success,
    ).toBe(false);
  });

  it("infers the profile type from the schema", () => {
    expectTypeOf<UserProfile>().toEqualTypeOf<{
      displayName: string;
      targetLanguage: string;
      uiLanguage: string;
      timezone: string;
      declaredLevel: string;
      skillRatings: SkillRating[];
    }>();
  });
});
