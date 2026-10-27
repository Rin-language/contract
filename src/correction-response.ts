import { z } from "zod";
import { MAX_EDITS } from "./constants.js";
import { Edit } from "./edit.js";

export const CorrectionResponse = z.strictObject({
  edits: z.array(Edit).max(MAX_EDITS),
});
export type CorrectionResponse = z.infer<typeof CorrectionResponse>;
