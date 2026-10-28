import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// The valid ids belong to the language profile in the server configuration and
// are published through CapabilitiesResponse; the contract only checks shape.
/** The id of an error type of the learned language. A free string: keep a default branch for an unknown id. */
export const ErrorType = NonBlankString.meta({
  description:
    "The id of an error type of the learned language, such as particles or keigo_politeness for Japanese, agreement for French. Non-blank string. The valid ids belong to each language profile in the server configuration and are published by CapabilitiesResponse. A consumer never switches exhaustively on it and keeps a default branch with a neutral rendering.",
  examples: ["particles", "other"],
});
/** The id of an error type of the learned language. */
export type ErrorType = z.infer<typeof ErrorType>;
