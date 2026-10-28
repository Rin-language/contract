import { z } from "zod";
import { Level } from "./level.js";

export const CorrectionRequest = z.strictObject({
  text: z
    .string()
    .refine((text) => text.trim().length > 0, "text must not be blank"),
  level: Level.optional(),
});
export type CorrectionRequest = z.infer<typeof CorrectionRequest>;
