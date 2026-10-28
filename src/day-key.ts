import { z } from "zod";

// Only the server computes it; the contract checks the format and that the
// day exists.
/** A calendar day (`YYYY-MM-DD`) in the user's time zone, computed by the server. */
export const DayKey = z.iso.date().meta({
  description:
    "A calendar day in the user's time zone, formatted YYYY-MM-DD and zero-padded. The day must exist (2026-02-30 and 2026-13-01 are rejected, 2028-02-29 is accepted). Only the server computes it, from the instant and the profile's timezone, so streaks and goals never depend on a client clock.",
  examples: ["2026-10-28"],
});
/** A calendar day (`YYYY-MM-DD`). */
export type DayKey = z.infer<typeof DayKey>;
