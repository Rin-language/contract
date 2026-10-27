import { z } from "zod";
import { Edit } from "./edit.js";

export const CorrectionResponse = z.strictObject({
  edits: z.array(Edit),
  score: z.number().int().min(0).max(100),
});
export type CorrectionResponse = z.infer<typeof CorrectionResponse>;
