import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// Open on purpose, like ErrorType: each slice adds its own kind (writing,
// reading, listening, ...) without a breaking change.
/** The kind of an activity (`writing`, `reading`, ...). An open list: keep a default branch for an unknown kind. */
export const ActivityKind = NonBlankString.meta({
  description:
    "The kind of an activity, such as writing or reading. Non-blank string. The list is open, never a closed enum: each slice adds its own kind, so a consumer keeps a default branch for a kind it does not know.",
  examples: ["writing", "reading"],
});
/** The kind of an activity. */
export type ActivityKind = z.infer<typeof ActivityKind>;
