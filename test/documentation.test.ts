import { describe, expect, it } from "vitest";
import { z } from "zod";
import { publicSchemas } from "./public-schemas.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isBlank = (value: unknown) =>
  typeof value !== "string" || value.trim().length === 0;

// Every node a reader meets in the generated reference: the schema itself, each
// of its properties and the items of its arrays.
const undescribedPaths = (node: unknown, path: string): string[] => {
  if (!isRecord(node)) return [path];
  const missing = isBlank(node.description) ? [path] : [];
  const properties = isRecord(node.properties) ? node.properties : {};
  const fromProperties = Object.entries(properties).flatMap(([key, property]) =>
    undescribedPaths(property, `${path}.${key}`),
  );
  const fromItems =
    node.items === undefined ? [] : undescribedPaths(node.items, `${path}[]`);
  return [...missing, ...fromProperties, ...fromItems];
};

type Declared = [path: string, schema: z.core.$ZodType, example: unknown];

const examplesOf = (schema: z.core.$ZodType): unknown[] => {
  const examples = z.globalRegistry.get(schema)?.examples;
  return Array.isArray(examples) ? examples : [];
};

const declaredExamples = (
  schema: z.core.$ZodType,
  path: string,
): Declared[] => {
  const own = examplesOf(schema).map(
    (example): Declared => [path, schema, example],
  );
  if (schema instanceof z.core.$ZodObject) {
    return [
      ...own,
      ...Object.entries(schema._zod.def.shape).flatMap(([key, field]) =>
        declaredExamples(field, `${path}.${key}`),
      ),
    ];
  }
  if (schema instanceof z.core.$ZodArray) {
    return [...own, ...declaredExamples(schema._zod.def.element, `${path}[]`)];
  }
  if (
    schema instanceof z.core.$ZodOptional ||
    schema instanceof z.core.$ZodNullable ||
    schema instanceof z.core.$ZodDefault
  ) {
    return [...own, ...declaredExamples(schema._zod.def.innerType, path)];
  }
  return own;
};

describe("schema documentation", () => {
  it.each(publicSchemas)(
    "describes %s and each of its fields",
    (name, schema) => {
      const jsonSchema = z.toJSONSchema(schema, {
        io: "output",
      });

      expect(undescribedPaths(jsonSchema, name)).toEqual([]);
    },
  );

  it.each(publicSchemas)(
    "accepts every declared example of %s",
    (name, schema) => {
      const rejected = declaredExamples(schema, name)
        .filter(([, target, example]) => !z.safeParse(target, example).success)
        .map(([path]) => path);

      expect(rejected).toEqual([]);
    },
  );

  it("declares examples on the schemas that need them", () => {
    const total = publicSchemas.flatMap(([name, schema]) =>
      declaredExamples(schema, name),
    ).length;

    expect(total).toBeGreaterThan(10);
  });
});
