import { z } from "zod";
import { MAX_TEXT_LENGTH } from "./constants.js";
import { JlptLevel } from "./jlpt-level.js";

export const CorrectionRequest = z.strictObject({
  text: z
    .string()
    .max(MAX_TEXT_LENGTH)
    .refine((text) => text.trim().length > 0, "text must not be blank"),
  level: JlptLevel.optional(),
});
export type CorrectionRequest = z.infer<typeof CorrectionRequest>;
