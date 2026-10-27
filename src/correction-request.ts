import { z } from "zod";
import { JlptLevel } from "./jlpt-level.js";

export const CorrectionRequest = z.strictObject({
  text: z
    .string()
    .refine((text) => text.trim().length > 0, "text must not be blank"),
  level: JlptLevel.optional(),
});
export type CorrectionRequest = z.infer<typeof CorrectionRequest>;
