import { z } from "zod";

export const NonBlankString = z
  .string()
  .refine((value) => value.trim().length > 0, "must not be blank");
