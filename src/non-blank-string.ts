import { z } from "zod";

export const NonBlankString = z
  .string()
  .refine((value) => value.trim().length > 0, "must not be blank")
  .meta({
    description:
      "A string with at least one character that is not whitespace after trim(). The value is never trimmed or altered.",
  });
