import { z } from "zod";
import { ErrorType } from "./error-type.js";
import { Level } from "./level.js";

/** One correction of a span of the submitted text. Positions are UTF-16 code units, as in `String.prototype.slice`. */
export const Edit = z
  .strictObject({
    start: z.number().int().nonnegative().meta({
      description:
        "First UTF-16 index of the faulty span, counted from the beginning of the submitted text. Non-negative integer. UTF-16 code units are the indices String.prototype.slice uses, so a browser can use them directly.",
    }),
    end: z.number().int().nonnegative().meta({
      description:
        "Exclusive end index of the faulty span, in UTF-16 code units. Non-negative integer, never less than start. start equal to end is an insertion.",
    }),
    replacement: z.string().meta({
      description:
        "Text that replaces the span. An empty string is a deletion.",
    }),
    errorType: ErrorType.meta({
      description:
        "An error type id of the request's language, as published by CapabilitiesResponse. A consumer keeps a default branch for an id it does not know.",
    }),
    level: Level.meta({
      description:
        "Always set: the level of the matching grammar point when one matched, the model's estimate otherwise. Same scale as the language.",
    }),
    grammarPointId: z.string().min(1).nullable().meta({
      description:
        "Id of the matching grammar point of the language pack, or null when the catalog has none. The key itself is required. An empty string is rejected.",
    }),
    explanation: z
      .string()
      .refine((text) => text.trim().length > 0, "explanation must not be blank")
      .meta({
        description:
          "Why the span is wrong. Must not be blank: at least one character that is not whitespace after trim().",
      }),
  })
  .refine((edit) => edit.start <= edit.end, {
    message: "start must not be greater than end",
    path: ["start"],
  })
  .meta({
    description:
      "One correction of a span of the submitted text. Rule that JSON Schema cannot express: start must not be greater than end. The struck-through original is text.slice(start, end). Unknown keys are rejected.",
    examples: [
      {
        start: 0,
        end: 3,
        replacement: "学校に",
        errorType: "particles",
        level: "N5",
        grammarPointId: "ni_particle",
        explanation: "Utilisation de la mauvaise particule de destination.",
      },
      {
        start: 4,
        end: 4,
        replacement: "は",
        errorType: "other",
        level: "N5",
        grammarPointId: null,
        explanation: "A topic particle is missing.",
      },
    ],
  });
/** One correction of a span of the submitted text. */
export type Edit = z.infer<typeof Edit>;
