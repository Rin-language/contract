import { z } from "zod";
import { ErrorType } from "./error-type.js";
import { Level } from "./level.js";

export const Edit = z
  .strictObject({
    // UTF-16 code units, as in String.prototype.slice, so a browser can use them directly.
    start: z.number().int().nonnegative(),
    end: z.number().int().nonnegative(),
    replacement: z.string(),
    errorType: ErrorType,
    level: Level,
    // Null when the catalog has no matching grammar point.
    grammarPointId: z.string().min(1).nullable(),
    explanation: z
      .string()
      .refine(
        (text) => text.trim().length > 0,
        "explanation must not be blank",
      ),
  })
  .refine((edit) => edit.start <= edit.end, {
    message: "start must not be greater than end",
    path: ["start"],
  });
export type Edit = z.infer<typeof Edit>;
