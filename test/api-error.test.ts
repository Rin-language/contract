import { describe, expect, expectTypeOf, it } from "vitest";
import { ApiError, ApiErrorCode } from "../src/api-error.js";

const expectedCodes = [
  "invalid_request",
  "unauthorized",
  "forbidden",
  "not_found",
  "payload_too_large",
  "rate_limited",
  "quota_exceeded",
  "unsupported_language",
  "ai_unavailable",
  "ai_output_invalid",
  "internal_error",
] as const;

describe("ApiErrorCode", () => {
  it("lists exactly the expected codes", () => {
    expect([...ApiErrorCode.options].sort()).toEqual([...expectedCodes].sort());
  });

  it.each(["unknown_code", "Not_Found", "", "not-found"])(
    "rejects %j",
    (code) => {
      expect(ApiErrorCode.safeParse(code).success).toBe(false);
    },
  );

  it("infers the union of the codes", () => {
    expectTypeOf<ApiErrorCode>().toEqualTypeOf<
      (typeof expectedCodes)[number]
    >();
  });
});

describe("ApiError", () => {
  const valid = {
    error: { code: "rate_limited", message: "Too many requests." },
  };

  it.each(expectedCodes)("accepts the code %s", (code) => {
    expect(
      ApiError.safeParse({ error: { code, message: "Something happened." } })
        .success,
    ).toBe(true);
  });

  it("rejects an unknown code", () => {
    expect(
      ApiError.safeParse({ error: { code: "teapot", message: "No." } }).success,
    ).toBe(false);
  });

  it("rejects a blank message", () => {
    expect(
      ApiError.safeParse({ error: { code: "not_found", message: " " } })
        .success,
    ).toBe(false);
  });

  it("rejects a missing message", () => {
    expect(ApiError.safeParse({ error: { code: "not_found" } }).success).toBe(
      false,
    );
  });

  it("rejects a missing error wrapper", () => {
    expect(ApiError.safeParse(valid.error).success).toBe(false);
  });

  it("rejects an unknown key beside the error", () => {
    expect(ApiError.safeParse({ ...valid, stack: "at x" }).success).toBe(false);
  });

  it("rejects an unknown key inside the error", () => {
    expect(
      ApiError.safeParse({ error: { ...valid.error, stack: "at x" } }).success,
    ).toBe(false);
  });

  it("accepts optional details inside the error", () => {
    expect(
      ApiError.safeParse({
        error: { ...valid.error, details: { field: "text", limit: 2000 } },
      }).success,
    ).toBe(true);
  });

  it("accepts empty details", () => {
    expect(
      ApiError.safeParse({ error: { ...valid.error, details: {} } }).success,
    ).toBe(true);
  });

  it.each([null, "text too long", ["text"], 42])(
    "rejects the details %j, which are not an object",
    (details) => {
      expect(
        ApiError.safeParse({ error: { ...valid.error, details } }).success,
      ).toBe(false);
    },
  );

  it("rejects details beside the error", () => {
    expect(ApiError.safeParse({ ...valid, details: {} }).success).toBe(false);
  });

  it("infers the error type from the schema", () => {
    expectTypeOf<ApiError>().toEqualTypeOf<{
      error: {
        code: ApiErrorCode;
        message: string;
        details?: Record<string, unknown> | undefined;
      };
    }>();
  });
});
