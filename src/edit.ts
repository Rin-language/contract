import { z } from "zod";
import { ErrorType } from "./error-type.js";

export const Edit = z
  .strictObject({
    // UTF-16 code units, as in String.prototype.slice, so a browser can use them directly.
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
    replacement: z.string(),
    errorType: ErrorType,
    explanation: z.string().min(1),
  })
  .refine((edit) => edit.start <= edit.end, {
    message: "start must not be greater than end",
    path: ["start"],
  });
export type Edit = z.infer<typeof Edit>;
