import { z } from "zod";
import * as api from "../src/index.js";

const isSchema = (value: unknown): value is z.ZodType =>
  value instanceof z.ZodType;

// Page is a factory, not a schema: core instantiates it for its own routes.
export const publicSchemas: [string, z.ZodType][] = Object.entries(api)
  .flatMap(([name, value]): [string, z.ZodType][] =>
    isSchema(value) ? [[name, value]] : [],
  )
  .sort(([left], [right]) => left.localeCompare(right));
