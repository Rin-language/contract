import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// The scale (N5-N1, A1-C2, ...) belongs to the language profile in the server
// configuration and is published through CapabilitiesResponse.
/** A level in the scale of the learned language (`N5` to `N1`, `A1` to `C2`, ...). A free string. */
export const Level = NonBlankString.meta({
  description:
    "A level in the scale of the learned language, such as N5 to N1 for Japanese or A1 to C2 for CEFR languages. Non-blank string. The scale and its order come from the language profile and are published by CapabilitiesResponse. The contract does not check that a level belongs to the scale of the language: the server does.",
  examples: ["N4", "B1"],
});
/** A level in the scale of the learned language. */
export type Level = z.infer<typeof Level>;
