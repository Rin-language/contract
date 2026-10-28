import { describe, expect, expectTypeOf, it } from "vitest";
import { SkillRating } from "../src/skill-rating.js";

const valid = { language: "ja", skill: "reading", rating: 1234.5, votes: 12 };

describe("SkillRating", () => {
  it("accepts a valid rating", () => {
    expect(SkillRating.safeParse(valid).success).toBe(true);
  });

  it("accepts a rating with no vote yet", () => {
    expect(SkillRating.safeParse({ ...valid, votes: 0 }).success).toBe(true);
  });

  it.each([0, -150, 2800])("accepts the rating %d", (rating) => {
    expect(SkillRating.safeParse({ ...valid, rating }).success).toBe(true);
  });

  it("accepts a skill added later by a capabilities response", () => {
    expect(
      SkillRating.safeParse({ ...valid, skill: "shadowing" }).success,
    ).toBe(true);
  });

  it.each([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN])(
    "rejects the non-finite rating %d",
    (rating) => {
      expect(SkillRating.safeParse({ ...valid, rating }).success).toBe(false);
    },
  );

  it.each([-1, 1.5])("rejects %d votes", (votes) => {
    expect(SkillRating.safeParse({ ...valid, votes }).success).toBe(false);
  });

  it.each(["", "  "])("rejects the blank skill %j", (skill) => {
    expect(SkillRating.safeParse({ ...valid, skill }).success).toBe(false);
  });

  it.each(["zh-CN", "JA", ""])(
    "rejects the malformed language %j",
    (language) => {
      expect(SkillRating.safeParse({ ...valid, language }).success).toBe(false);
    },
  );

  it.each(["language", "skill", "rating", "votes"])(
    "rejects a missing %s",
    (key) => {
      const { [key]: _removed, ...rest } = valid as Record<string, unknown>;

      expect(SkillRating.safeParse(rest).success).toBe(false);
    },
  );

  it("rejects an unknown key", () => {
    expect(SkillRating.safeParse({ ...valid, userId: "u1" }).success).toBe(
      false,
    );
  });

  it("infers the rating type from the schema", () => {
    expectTypeOf<SkillRating>().toEqualTypeOf<{
      language: string;
      skill: string;
      rating: number;
      votes: number;
    }>();
  });
});
