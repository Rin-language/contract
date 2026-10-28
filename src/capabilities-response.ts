import { z } from "zod";
import { ErrorType } from "./error-type.js";
import { LanguageCode } from "./language-code.js";
import { Level } from "./level.js";

const hasNoDuplicate = (values: readonly string[]) =>
  new Set(values).size === values.length;

export const LanguageCapabilities = z.strictObject({
  code: LanguageCode,
  errorTypes: z
    .array(ErrorType)
    .min(1)
    .refine(hasNoDuplicate, "error types must be unique"),
  // Ordered from the lowest level to the highest (N5 to N1, A1 to C2).
  levels: z.array(Level).min(1).refine(hasNoDuplicate, "levels must be unique"),
});
export type LanguageCapabilities = z.infer<typeof LanguageCapabilities>;

export const CapabilitiesResponse = z.strictObject({
  languages: z
    .array(LanguageCapabilities)
    .min(1)
    .refine(
      (languages) => hasNoDuplicate(languages.map((language) => language.code)),
      "languages must be unique",
    ),
});
export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponse>;
