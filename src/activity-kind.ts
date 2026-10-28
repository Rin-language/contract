import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// Open on purpose, like ErrorType: each slice adds its own kind (writing,
// reading, listening, ...) without a breaking change.
export const ActivityKind = NonBlankString;
export type ActivityKind = z.infer<typeof ActivityKind>;
