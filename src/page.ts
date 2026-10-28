import { z } from "zod";

// Cursor-based: a null cursor marks the last page. There is no total, which
// would be costly to compute and unstable while items change.
export const Page = <Item extends z.ZodType>(item: Item) =>
  z.strictObject({
    items: z.array(item),
    nextCursor: z.string().min(1).nullable(),
  });
export type Page<Item> = { items: Item[]; nextCursor: string | null };
