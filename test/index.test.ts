import { describe, expect, it } from "vitest";
import * as api from "../src/index.js";

describe("public entry point", () => {
  it("exposes the constants, schemas and nothing else at runtime", () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        "API_VERSION",
        "CorrectionRequest",
        "CorrectionResponse",
        "Edit",
        "JlptLevel",
        "MAX_EDITS",
        "MAX_EXPLANATION_LENGTH",
        "MAX_TEXT_LENGTH",
      ].sort(),
    );
  });
});
