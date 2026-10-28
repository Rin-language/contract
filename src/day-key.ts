import { z } from "zod";

// A calendar day in the user's time zone. Only the server computes it; the
// contract checks the format and that the day exists.
export const DayKey = z.iso.date();
export type DayKey = z.infer<typeof DayKey>;
