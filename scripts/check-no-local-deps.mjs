// A local link or file dependency works on one machine and breaks every other
// install, so CI refuses it in package.json and in the lockfile.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const LOCAL_PROTOCOL = /^(link|file|portal):/;
const LOCKFILE_LOCAL_ENTRY =
  /^\s*(specifier|version):\s*['"]?(link|file|portal):/;

function collectManifestOffenders(value, path, offenders) {
  if (typeof value === "string") {
    if (LOCAL_PROTOCOL.test(value)) offenders.push(`${path} = ${value}`);
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    collectManifestOffenders(child, `${path}.${key}`, offenders);
  }
}

const directory = process.argv[2] ?? process.cwd();
const offenders = [];

const manifest = JSON.parse(
  readFileSync(join(directory, "package.json"), "utf8"),
);
collectManifestOffenders(manifest, "package.json", offenders);

readFileSync(join(directory, "pnpm-lock.yaml"), "utf8")
  .split("\n")
  .forEach((line, index) => {
    if (LOCKFILE_LOCAL_ENTRY.test(line)) {
      offenders.push(`pnpm-lock.yaml:${index + 1} ${line.trim()}`);
    }
  });

if (offenders.length > 0) {
  console.error("Local dependency references are not allowed:");
  for (const offender of offenders) console.error(`  ${offender}`);
  process.exit(1);
}
