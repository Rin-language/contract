import { describe, expect, expectTypeOf, it } from "vitest";
import { UserProfileUpdate } from "../src/user-profile-update.js";

describe("UserProfileUpdate", () => {
  it.each([
    ["displayName", "Rob"],
    ["targetLanguage", "zh"],
    ["uiLanguage", "en"],
    ["timezone", "Europe/Paris"],
    ["declaredLevel", "N3"],
  ])("accepts a change of %s alone", (key, value) => {
    expect(UserProfileUpdate.safeParse({ [key]: value }).success).toBe(true);
  });

  it("accepts several changes at once", () => {
    expect(
      UserProfileUpdate.safeParse({ targetLanguage: "fr", declaredLevel: "B1" })
        .success,
    ).toBe(true);
  });

  it("rejects an update with no change", () => {
    expect(UserProfileUpdate.safeParse({}).success).toBe(false);
  });

  it("rejects skill ratings sent by a client", () => {
    expect(
      UserProfileUpdate.safeParse({
        displayName: "Rob",
        skillRatings: [
          { language: "ja", skill: "reading", rating: 9999, votes: 1 },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty list of skill ratings", () => {
    expect(
      UserProfileUpdate.safeParse({ displayName: "Rob", skillRatings: [] })
        .success,
    ).toBe(false);
  });

  it("does not fill in a default target language", () => {
    expect(
      UserProfileUpdate.parse({ displayName: "Rob" }).targetLanguage,
    ).toBeUndefined();
  });

  it("keeps only the keys that were sent", () => {
    expect(UserProfileUpdate.parse({ timezone: "Asia/Tokyo" })).toEqual({
      timezone: "Asia/Tokyo",
    });
  });

  it.each(["displayName", "timezone", "declaredLevel"])(
    "rejects a blank %s",
    (key) => {
      expect(UserProfileUpdate.safeParse({ [key]: "  " }).success).toBe(false);
    },
  );

  it.each(["targetLanguage", "uiLanguage"])("rejects a malformed %s", (key) => {
    expect(UserProfileUpdate.safeParse({ [key]: "ja-JP" }).success).toBe(false);
  });

  it.each([
    "displayName",
    "targetLanguage",
    "uiLanguage",
    "timezone",
    "declaredLevel",
  ])("rejects a null %s", (key) => {
    expect(UserProfileUpdate.safeParse({ [key]: null }).success).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      UserProfileUpdate.safeParse({ displayName: "Rob", email: "a@b.c" })
        .success,
    ).toBe(false);
  });

  it("infers the update type from the schema", () => {
    expectTypeOf<UserProfileUpdate>().toEqualTypeOf<{
      displayName?: string | undefined;
      targetLanguage?: string | undefined;
      uiLanguage?: string | undefined;
      timezone?: string | undefined;
      declaredLevel?: string | undefined;
    }>();
  });
});
