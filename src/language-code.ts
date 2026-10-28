import { z } from "zod";

// Format only: which languages exist is the server configuration's decision.
export const LanguageCode = z.string().regex(/^[a-z]{2}$/);
export type LanguageCode = z.infer<typeof LanguageCode>;
