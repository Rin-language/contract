import { z } from "zod";

/** Body of `GET /health`: the server is up, and nothing else. */
export const HealthResponse = z
  .strictObject({
    status: z.literal("ok").meta({
      description: "The only accepted value: ok.",
    }),
  })
  .meta({
    description:
      "Body of GET /health. It says the server is up and nothing else: no version, no dependency status. Unknown keys are rejected.",
    examples: [{ status: "ok" }],
  });
/** Body of `GET /health`. */
export type HealthResponse = z.infer<typeof HealthResponse>;
