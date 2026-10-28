import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

/** An opaque identifier: store it and send it back, never parse it or build one. */
export const Id = NonBlankString.meta({
  description:
    "An opaque identifier. Non-blank string. A client stores it and sends it back, and never parses it nor builds one.",
  examples: ["a1"],
});
/** An opaque identifier. */
export type Id = z.infer<typeof Id>;
