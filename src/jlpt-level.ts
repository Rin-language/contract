import { z } from "zod";

export const JlptLevel = z.enum(["N5", "N4", "N3", "N2", "N1"]);
export type JlptLevel = z.infer<typeof JlptLevel>;
