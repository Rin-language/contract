import { z } from "zod";
import { Edit } from "./edit.js";

/** What the server returns for a correction: sorted, non-overlapping edits and a 0 to 100 score. */
export const CorrectionResponse = z
  .strictObject({
    edits: z.array(Edit).meta({
      description:
        "The corrections, sorted by position and non-overlapping: for every edit after the first, start must be greater than or equal to the previous edit's end (an edit may start exactly where the previous one ends). An empty array means no error was found. There is no correctedText field: apply the edits to the original text, from the last to the first.",
    }),
    score: z.number().int().min(0).max(100).meta({
      description:
        "Score of the text: an integer from 0 to 100 inclusive. Its consistency with the edits is not checked here.",
    }),
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
  })
  .meta({
    description:
      "What the server returns for a correction. Rule that JSON Schema cannot express: edits are sorted by position and never overlap. Unknown keys are rejected.",
    examples: [
      {
        edits: [
          {
            start: 0,
            end: 3,
            replacement: "学校に",
            errorType: "particles",
            level: "N5",
            grammarPointId: "ni_particle",
            explanation: "Utilisation de la mauvaise particule de destination.",
          },
        ],
        score: 85,
      },
      { edits: [], score: 100 },
    ],
  });
/** What the server returns for a correction. */
export type CorrectionResponse = z.infer<typeof CorrectionResponse>;
