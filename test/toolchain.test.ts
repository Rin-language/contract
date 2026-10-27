import { expect, it } from "vitest";
import { z } from "zod";

it("runs the test toolchain with zod available", () => {
  expect(z.string().parse("rin")).toBe("rin");
});
