import { describe, expect, expectTypeOf, it } from "vitest";
import { IsoDateTime } from "../src/iso-date-time.js";

describe("IsoDateTime", () => {
  it.each([
    "2026-10-28T09:32:00Z",
    "2026-10-28T09:32:00.123Z",
    "2026-10-28T16:32:00+07:00",
    "2026-10-28T04:02:00-05:30",
    "2028-02-29T00:00:00Z",
  ])("accepts %s", (value) => {
    expect(IsoDateTime.safeParse(value).success).toBe(true);
  });

  it.each([
    ["a date without a time", "2026-10-28"],
    ["a time without a time zone", "2026-10-28T09:32:00"],
    ["a day that does not exist", "2026-02-30T10:00:00Z"],
    ["February 29 of a common year", "2026-02-29T10:00:00Z"],
    ["a thirteenth month", "2026-13-01T10:00:00Z"],
    ["an hour out of range", "2026-10-28T25:00:00Z"],
    ["a space instead of T", "2026-10-28 09:32:00Z"],
    ["an empty string", ""],
  ])("rejects %s", (_label, value) => {
    expect(IsoDateTime.safeParse(value).success).toBe(false);
  });

  it.each([1_761_640_320_000, null])(
    "rejects the non-string value %j",
    (value) => {
      expect(IsoDateTime.safeParse(value).success).toBe(false);
    },
  );

  it("infers a string", () => {
    expectTypeOf<IsoDateTime>().toEqualTypeOf<string>();
  });
});
