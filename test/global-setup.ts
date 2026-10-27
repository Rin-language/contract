import { execFileSync } from "node:child_process";

export default function buildPackage(): void {
  execFileSync("pnpm", ["build"], { stdio: "pipe" });
}
