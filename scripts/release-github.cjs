#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const allowDirty = args.has("--allow-dirty") || process.env.ALLOW_DIRTY_RELEASE === "1";
const rawArgs = process.argv.slice(2);
function getOption(name) {
  const equalsArg = rawArgs.find((arg) => arg.startsWith(`${name}=`));
  if (equalsArg) {
    return equalsArg.slice(name.length + 1);
  }

  const index = rawArgs.indexOf(name);
  return index >= 0 ? rawArgs[index + 1] : undefined;
}

const version = getOption("--version") ?? pkg.version;
const tag = getOption("--tag") ?? `v${version}`;
const releaseRepo = getOption("--repo") ?? process.env.GITHUB_RELEASE_REPO;
const releaseDir = path.join(root, "release");

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !options.allowFailure) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    throw new Error(output || `${command} ${commandArgs.join(" ")} failed`);
  }

  return result;
}

function output(command, commandArgs, options = {}) {
  const result = run(command, commandArgs, { ...options, capture: true });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function requiredArtifactNames(releaseVersion) {
  return [
    `Tyria-Ledger-${releaseVersion}.dmg`,
    `Tyria-Ledger-${releaseVersion}.dmg.blockmap`,
    `Tyria-Ledger-${releaseVersion}-mac.zip`,
    `Tyria-Ledger-${releaseVersion}-mac.zip.blockmap`,
    `Tyria-Ledger-${releaseVersion}-arm64.dmg`,
    `Tyria-Ledger-${releaseVersion}-arm64.dmg.blockmap`,
    `Tyria-Ledger-${releaseVersion}-arm64-mac.zip`,
    `Tyria-Ledger-${releaseVersion}-arm64-mac.zip.blockmap`,
    `Tyria-Ledger-Setup-${releaseVersion}.exe`,
    `Tyria-Ledger-Setup-${releaseVersion}.exe.blockmap`,
    `Tyria-Ledger-${releaseVersion}.exe`,
    "latest.yml",
    "latest-mac.yml",
  ];
}

function ensureMacArtifactAliases(releaseVersion) {
  const aliases = [
    [`Tyria Ledger-${releaseVersion}.dmg`, `Tyria-Ledger-${releaseVersion}.dmg`],
    [`Tyria Ledger-${releaseVersion}.dmg.blockmap`, `Tyria-Ledger-${releaseVersion}.dmg.blockmap`],
    [`Tyria Ledger-${releaseVersion}-mac.zip`, `Tyria-Ledger-${releaseVersion}-mac.zip`],
    [`Tyria Ledger-${releaseVersion}-mac.zip.blockmap`, `Tyria-Ledger-${releaseVersion}-mac.zip.blockmap`],
    [`Tyria Ledger-${releaseVersion}-arm64.dmg`, `Tyria-Ledger-${releaseVersion}-arm64.dmg`],
    [`Tyria Ledger-${releaseVersion}-arm64.dmg.blockmap`, `Tyria-Ledger-${releaseVersion}-arm64.dmg.blockmap`],
    [`Tyria Ledger-${releaseVersion}-arm64-mac.zip`, `Tyria-Ledger-${releaseVersion}-arm64-mac.zip`],
    [`Tyria Ledger-${releaseVersion}-arm64-mac.zip.blockmap`, `Tyria-Ledger-${releaseVersion}-arm64-mac.zip.blockmap`],
  ];

  for (const [sourceName, aliasName] of aliases) {
    const sourcePath = path.join(releaseDir, sourceName);
    const aliasPath = path.join(releaseDir, aliasName);
    if (fs.existsSync(sourcePath) && !fs.existsSync(aliasPath)) {
      fs.copyFileSync(sourcePath, aliasPath);
    }
  }
}

function validateEnvironment() {
  try {
    output("gh", ["--version"]);
  } catch {
    fail("GitHub CLI is not installed. Install it with `brew install gh`, then run `gh auth login`.");
  }

  if (!dryRun) {
    const auth = run("gh", ["auth", "status"], { capture: true, allowFailure: true });
    if (auth.status !== 0) {
      fail("GitHub CLI is installed but not authenticated. Run `gh auth login` once, then retry.");
    }
  }

  const dirty = output("git", ["status", "--porcelain"]);
  if (dirty && dryRun) {
    console.warn("Dry run notice: worktree is dirty. A real release will require a clean commit unless `--allow-dirty` is passed.");
  } else if (dirty && !allowDirty) {
    fail(
      [
        "Refusing to create a GitHub release from a dirty worktree.",
        "Commit or stash your changes first so the release tag matches the shipped build.",
        "For an intentional local test only, rerun with `--allow-dirty`.",
      ].join("\n"),
    );
  }
}

function collectArtifacts() {
  if (!fs.existsSync(releaseDir)) {
    fail("The release directory does not exist yet. Build release artifacts first.");
  }

  ensureMacArtifactAliases(version);

  const artifacts = requiredArtifactNames(version).map((name) => path.join(releaseDir, name));
  const missing = artifacts.filter((artifact) => !fs.existsSync(artifact));

  if (missing.length) {
    fail(
      [
        `Missing ${missing.length} release artifact(s) for ${version}:`,
        ...missing.map((artifact) => `- ${path.relative(root, artifact)}`),
        "",
        "Build Mac and Windows release artifacts before uploading.",
      ].join("\n"),
    );
  }

  return artifacts;
}

function getReleaseNotes() {
  return [
    `Tyria Ledger ${version}`,
    "",
    "This patch expands account planning, acquisition guidance, and Fishing workflows.",
    "",
    "Highlights:",
    "- Account-aware build goals and equipment comparison.",
    "- Improved daily planning, acquisition guidance, craft maps, and item detail behavior.",
    "- A complete Fishing guide with mastery and Fishing Power recommendations.",
    "- A locally stored directory of 287 fish with locations, holes, bait, time, and power requirements.",
    "- Ranked Fishing training, collection, and gold routes based on account progress.",
    "",
    "This release includes macOS Intel, macOS Apple Silicon, Windows installer, and Windows portable builds.",
  ].join("\n");
}

function main() {
  validateEnvironment();
  const artifacts = collectArtifacts();
  const repoArgs = releaseRepo ? ["--repo", releaseRepo] : [];
  const releaseExists = run("gh", ["release", "view", tag, ...repoArgs], {
    capture: true,
    allowFailure: true,
  }).status === 0;

  const commandArgs = releaseExists
    ? ["release", "upload", tag, ...artifacts, "--clobber", ...repoArgs]
    : [
        "release",
        "create",
        tag,
        ...artifacts,
        "--title",
        `Tyria Ledger ${version}`,
        "--notes",
        getReleaseNotes(),
        ...repoArgs,
      ];

  if (dryRun) {
    console.log(`${releaseExists ? "Would update" : "Would create"} GitHub release ${tag}${releaseRepo ? ` in ${releaseRepo}` : ""}`);
    artifacts.forEach((artifact) => console.log(`- ${path.relative(root, artifact)}`));
    return;
  }

  run("gh", commandArgs);
  console.log(`${releaseExists ? "Updated" : "Created"} GitHub release ${tag}`);
}

main();
