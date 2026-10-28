import { describe, expect, expectTypeOf, it } from "vitest";
import { DayKey } from "../src/day-key.js";

describe("DayKey", () => {
  it.each([
    "2026-10-28",
    "2026-01-01",
    "2026-12-31",
    "2028-02-29",
    "2000-02-29",
  ])("accepts the calendar day %s", (value) => {
    expect(DayKey.safeParse(value).success).toBe(true);
  });

  it.each([
    ["a day that does not exist", "2026-02-30"],
    ["February 29 of a common year", "2026-02-29"],
    ["February 29 of a century that is not a leap year", "1900-02-29"],
    ["April 31", "2026-04-31"],
    ["a thirteenth month", "2026-13-01"],
    ["month zero", "2026-00-10"],
    ["day zero", "2026-10-00"],
    ["a month and day without zero padding", "2026-1-5"],
    ["another separator", "2026/10/28"],
    ["a date-time", "2026-10-28T00:00:00Z"],
    ["an empty string", ""],
  ])("rejects %s", (_label, value) => {
    expect(DayKey.safeParse(value).success).toBe(false);
  });

  it.each([20261028, null])("rejects the non-string value %j", (value) => {
    expect(DayKey.safeParse(value).success).toBe(false);
  });

  it("infers a string", () => {
    expectTypeOf<DayKey>().toEqualTypeOf<string>();
  });
});
