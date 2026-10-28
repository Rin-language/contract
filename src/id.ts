import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// Opaque: clients store and send it back, never parse it.
export const Id = NonBlankString;
export type Id = z.infer<typeof Id>;
