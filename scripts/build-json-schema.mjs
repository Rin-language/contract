import { mkdirSync, writeFileSync } from "node:fs";
import { z } from "zod";
import * as api from "../dist/index.js";

const outputDirectory = new URL("../dist/json-schema/", import.meta.url);
mkdirSync(outputDirectory, { recursive: true });

// Page is a factory and API_VERSION a string: only schema instances are written.
for (const [name, value] of Object.entries(api)) {
  if (!(value instanceof z.ZodType)) continue;
  // "output" is what the server returns, so defaulted fields count as present.
  const jsonSchema = z.toJSONSchema(value, { io: "output" });
  writeFileSync(
    new URL(`${name}.json`, outputDirectory),
    `${JSON.stringify(jsonSchema, null, 2)}\n`,
  );
}
