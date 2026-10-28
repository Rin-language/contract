import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { Page } from "../src/page.js";

const NumberPage = Page(z.number());

describe("Page", () => {
  it("accepts a page with a next cursor", () => {
    expect(
      NumberPage.safeParse({ items: [1, 2], nextCursor: "abc" }).success,
    ).toBe(true);
  });

  it("accepts the last page, marked by a null cursor", () => {
    expect(NumberPage.safeParse({ items: [3], nextCursor: null }).success).toBe(
      true,
    );
  });

  it("accepts an empty page", () => {
    expect(NumberPage.safeParse({ items: [], nextCursor: null }).success).toBe(
      true,
    );
  });

  it("rejects a missing cursor key", () => {
    expect(NumberPage.safeParse({ items: [1] }).success).toBe(false);
  });

  it("rejects an empty cursor", () => {
    expect(NumberPage.safeParse({ items: [], nextCursor: "" }).success).toBe(
      false,
    );
  });

  it("rejects an item that does not match the item schema", () => {
    expect(
      NumberPage.safeParse({ items: ["a"], nextCursor: null }).success,
    ).toBe(false);
  });

  it("rejects a missing items key", () => {
    expect(NumberPage.safeParse({ nextCursor: null }).success).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      NumberPage.safeParse({ items: [], nextCursor: null, total: 0 }).success,
    ).toBe(false);
  });

  it("infers the page type from the item schema", () => {
    expectTypeOf<z.infer<typeof NumberPage>>().toEqualTypeOf<Page<number>>();
  });

  it("types a page of objects", () => {
    const EditorPage = Page(z.strictObject({ id: z.string() }));

    expectTypeOf<z.infer<typeof EditorPage>>().toEqualTypeOf<{
      items: { id: string }[];
      nextCursor: string | null;
    }>();
  });
});
