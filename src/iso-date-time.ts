import { z } from "zod";

// The offset (or Z) is required, so the value never depends on the reader's
// time zone.
/** An instant: ISO 8601 date-time with `Z` or a numeric offset. */
export const IsoDateTime = z.iso.datetime({ offset: true }).meta({
  description:
    "An instant: an ISO 8601 date-time with Z or a numeric offset, so the value never depends on the reader's time zone. Fractional seconds are allowed. A date alone, a time without a zone and a day that does not exist (2026-02-30T10:00:00Z) are rejected.",
  examples: ["2026-10-28T09:32:00Z", "2026-10-28T16:32:00+07:00"],
});
/** An instant, as an ISO 8601 string. */
export type IsoDateTime = z.infer<typeof IsoDateTime>;
