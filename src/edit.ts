import { z } from "zod";
import { MAX_EXPLANATION_LENGTH } from "./constants.js";

export const Edit = z
  .strictObject({
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
    replacement: z.string(),
    explanation: z.string().min(1).max(MAX_EXPLANATION_LENGTH),
  })
  .refine((edit) => edit.start <= edit.end, {
    message: "start must not be greater than end",
    path: ["start"],
  });
export type Edit = z.infer<typeof Edit>;
