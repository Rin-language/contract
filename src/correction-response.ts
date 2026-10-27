import { z } from "zod";
import { Edit } from "./edit.js";

export const CorrectionResponse = z
  .strictObject({
    edits: z.array(Edit),
    score: z.number().int().min(0).max(100),
  })
  .superRefine((response, context) => {
    response.edits.forEach((edit, index) => {
      const previous = response.edits[index - 1];
      if (previous === undefined || edit.start >= previous.end) return;
      context.addIssue({
        code: "custom",
        message: "edits must be sorted by position and must not overlap",
        path: ["edits", index, "start"],
      });
    });
  });
export type CorrectionResponse = z.infer<typeof CorrectionResponse>;
