import { z } from "zod";

export const LimitsResponse = z.strictObject({
  maxTextLength: z.number().int().positive(),
  maxEdits: z.number().int().positive(),
  maxExplanationLength: z.number().int().positive(),
});
export type LimitsResponse = z.infer<typeof LimitsResponse>;
