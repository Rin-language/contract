import { describe, expect, expectTypeOf, it } from "vitest";
import { HealthResponse } from "../src/health-response.js";

describe("HealthResponse", () => {
  it("accepts an ok status", () => {
    expect(HealthResponse.safeParse({ status: "ok" }).success).toBe(true);
  });

  it.each(["degraded", "OK", ""])("rejects the status %j", (status) => {
    expect(HealthResponse.safeParse({ status }).success).toBe(false);
  });

  it("rejects a missing status", () => {
    expect(HealthResponse.safeParse({}).success).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(
      HealthResponse.safeParse({ status: "ok", version: "1.0.0" }).success,
    ).toBe(false);
  });

  it("infers the response type from the schema", () => {
    expectTypeOf<HealthResponse>().toEqualTypeOf<{ status: "ok" }>();
  });
});
