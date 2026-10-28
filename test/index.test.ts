import { describe, expect, it } from "vitest";
import * as api from "../src/index.js";

describe("public entry point", () => {
  it("exposes the constants, schemas and nothing else at runtime", () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        "API_VERSION",
        "ActivityKind",
        "ApiError",
        "ApiErrorCode",
        "CapabilitiesResponse",
        "CorrectionRequest",
        "CorrectionResponse",
        "DayKey",
        "Edit",
        "ErrorType",
        "HealthResponse",
        "Id",
        "IsoDateTime",
        "LanguageCapabilities",
        "LanguageCode",
        "Level",
        "LimitsResponse",
        "Page",
        "SkillRating",
        "UserProfile",
      ].sort(),
    );
  });
});
