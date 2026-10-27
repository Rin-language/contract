import { z } from "zod";
import { Edit } from "./edit.js";

export const CorrectionResponse = z.strictObject({
  edits: z.array(Edit),
});
export type CorrectionResponse = z.infer<typeof CorrectionResponse>;
