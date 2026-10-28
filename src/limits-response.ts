import { z } from "zod";

/** Body of `GET /v1/limits`: the limits the server is configured with. The server stays the authority. */
export const LimitsResponse = z
  .strictObject({
    maxTextLength: z.number().int().positive().meta({
      description:
        "Maximum length accepted for the text to correct. Positive integer.",
    }),
    maxEdits: z.number().int().positive().meta({
      description: "Maximum number of edits returned. Positive integer.",
    }),
    maxExplanationLength: z.number().int().positive().meta({
      description: "Maximum length of an edit explanation. Positive integer.",
    }),
  })
  .meta({
    description:
      "The limits the server is configured with, so a client can adapt before sending. All keys are required. The schemas of the contract check shape only, so a consumer enforces these limits before spending any model call. Unknown keys are rejected.",
    examples: [
      { maxTextLength: 2000, maxEdits: 100, maxExplanationLength: 500 },
    ],
  });
/** The limits the server is configured with. */
export type LimitsResponse = z.infer<typeof LimitsResponse>;
