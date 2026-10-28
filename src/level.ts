import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// The scale (N5-N1, A1-C2, ...) belongs to the language profile in the server
// configuration and is published through CapabilitiesResponse.
export const Level = NonBlankString;
export type Level = z.infer<typeof Level>;
