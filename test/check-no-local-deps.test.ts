import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = new URL(
  "../scripts/check-no-local-deps.mjs",
  import.meta.url,
).pathname;
const cleanLockfile = [
  "lockfileVersion: '9.0'",
  "settings:",
  "  excludeLinksFromLockfile: false",
  "importers:",
  "  .:",
  "    devDependencies:",
  "      zod:",
  "        specifier: 4.6.7",
  "        version: 4.6.7",
  "",
].join("\n");

const directories: string[] = [];

function runCheck(packageJson: object, lockfile: string) {
  const directory = mkdtempSync(join(tmpdir(), "no-local-deps-"));
  directories.push(directory);
  writeFileSync(join(directory, "package.json"), JSON.stringify(packageJson));
  writeFileSync(join(directory, "pnpm-lock.yaml"), lockfile);
  return spawnSync("node", [scriptPath, directory], { encoding: "utf8" });
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("check-no-local-deps", () => {
  it("passes when no dependency points at a local path", () => {
    const result = runCheck(
      { devDependencies: { zod: "4.6.7" } },
      cleanLockfile,
    );

    expect(result.status).toBe(0);
  });

  it.each(["link:../contract", "file:../contract", "portal:../contract"])(
    "rejects %s in package.json",
    (specifier) => {
      const result = runCheck(
        { devDependencies: { zod: specifier } },
        cleanLockfile,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("package.json");
    },
  );

  it("rejects a local path in package.json overrides", () => {
    const result = runCheck(
      { pnpm: { overrides: { zod: "link:../zod" } } },
      cleanLockfile,
    );

    expect(result.status).toBe(1);
  });

  it("rejects a link: entry in the lockfile", () => {
    const lockfile = `${cleanLockfile}        version: link:../contract\n`;
    const result = runCheck({ devDependencies: { zod: "4.6.7" } }, lockfile);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pnpm-lock.yaml");
  });
});
