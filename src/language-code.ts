import { z } from "zod";

// Which languages exist is the server configuration's decision.
/** A language code: two lowercase letters (`ja`, `zh`, `fr`). Format only. */
export const LanguageCode = z
  .string()
  .regex(/^[a-z]{2}$/)
  .meta({
    description:
      "A language code: exactly two lowercase ASCII letters, in the style of ISO 639-1 (ja, zh, fr). No region or script suffix (zh-CN is rejected), no uppercase. Only the format is checked, not membership in the ISO list: a well-formed code the server has no profile for is refused by the server with the unsupported_language error code.",
    examples: ["ja", "fr"],
  });
/** A language code. */
export type LanguageCode = z.infer<typeof LanguageCode>;
