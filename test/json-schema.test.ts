import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as api from "../src/index.js";
import { publicSchemas } from "./public-schemas.js";

const outputDirectory = new URL("../dist/json-schema/", import.meta.url);

describe("JSON Schema reference", () => {
  it.each(publicSchemas)("converts %s without error", (_name, schema) => {
    expect(() => z.toJSONSchema(schema, { io: "output" })).not.toThrow();
  });

  it("writes one file per exported schema in the build", () => {
    const expected = publicSchemas.map(([name]) => `${name}.json`).sort();

    expect(readdirSync(outputDirectory).sort()).toEqual(expected);
  });

  it("writes the JSON Schema of the built schema", () => {
    const written = JSON.parse(
      readFileSync(new URL("Edit.json", outputDirectory), "utf8"),
    );

    expect(written).toEqual(
      JSON.parse(JSON.stringify(z.toJSONSchema(api.Edit, { io: "output" }))),
    );
  });

  it("exports the generated files from package.json", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    );

    expect(manifest.exports["./json-schema/*"]).toBe("./dist/json-schema/*");
  });
});
