import { z } from "zod";

// Cursor-based: a null cursor marks the last page. There is no total, which
// would be costly to compute and unstable while items change.
/**
 * Builds the schema of a cursor-based paginated response for an item schema.
 *
 * Page is a factory, so no JSON Schema is generated for it in the package:
 * instantiate it and call `z.toJSONSchema(Page(Item))` for the items you serve.
 */
export const Page = <Item extends z.ZodType>(item: Item) =>
  z
    .strictObject({
      items: z.array(item).meta({
        description: "The items of this page. May be empty.",
      }),
      nextCursor: z.string().min(1).nullable().meta({
        description:
          "Opaque, non-empty cursor to send to get the next page. null marks the last page. The key is required. There is no total, which is costly to compute and unstable while items change.",
      }),
    })
    .meta({
      description: "A cursor-based page of items. Unknown keys are rejected.",
    });
/** A cursor-based page of items. */
export type Page<Item> = { items: Item[]; nextCursor: string | null };
