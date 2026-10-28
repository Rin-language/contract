import { describe, expect, expectTypeOf, it } from "vitest";
import { Id } from "../src/id.js";

describe("Id", () => {
  it.each(["a1", "01J9Z3K8QW", "550e8400-e29b-41d4-a716-446655440000", "x"])(
    "accepts the opaque id %s",
    (id) => {
      expect(Id.safeParse(id).success).toBe(true);
    },
  );

  it.each([
    ["an empty string", ""],
    ["a whitespace-only string", " \t　"],
  ])("rejects %s", (_label, id) => {
    expect(Id.safeParse(id).success).toBe(false);
  });

  it.each([42, null, undefined])("rejects the non-string value %j", (id) => {
    expect(Id.safeParse(id).success).toBe(false);
  });

  it("infers a string", () => {
    expectTypeOf<Id>().toEqualTypeOf<string>();
  });
});
