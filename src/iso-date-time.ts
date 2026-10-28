import { z } from "zod";

// An instant: the offset (or Z) is required, so the value never depends on the
// reader's time zone.
export const IsoDateTime = z.iso.datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTime>;
