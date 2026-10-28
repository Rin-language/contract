import type { z } from "zod";
import { NonBlankString } from "./non-blank-string.js";

// The valid ids belong to the language profile in the server configuration and
// are published through CapabilitiesResponse; the contract only checks shape.
export const ErrorType = NonBlankString;
export type ErrorType = z.infer<typeof ErrorType>;
