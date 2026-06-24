#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const allowDirty = args.has("--allow-dirty") || process.env.ALLOW_DIRTY_RELEASE === "1";
const versionArg = process.argv.slice(2).find((arg) => /^--version=/.test(arg));
const tagArg = process.argv.slice(2).find((arg) => /^--tag=/.test(arg));
const version = versionArg ? versionArg.split("=")[1] : pkg.version;
const tag = tagArg ? tagArg.split("=")[1] : `v${version}`;
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
    `Tyria Ledger-${releaseVersion}.dmg`,
    `Tyria Ledger-${releaseVersion}.dmg.blockmap`,
    `Tyria Ledger-${releaseVersion}-mac.zip`,
    `Tyria Ledger-${releaseVersion}-mac.zip.blockmap`,
    `Tyria Ledger-${releaseVersion}-arm64.dmg`,
    `Tyria Ledger-${releaseVersion}-arm64.dmg.blockmap`,
    `Tyria Ledger-${releaseVersion}-arm64-mac.zip`,
    `Tyria Ledger-${releaseVersion}-arm64-mac.zip.blockmap`,
    `Tyria Ledger Setup ${releaseVersion}.exe`,
    `Tyria Ledger Setup ${releaseVersion}.exe.blockmap`,
    `Tyria Ledger ${releaseVersion}.exe`,
    "latest.yml",
    "latest-mac.yml",
  ];
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
    "Desktop Guild Wars 2 Trading Post, crafting, gathering, and account companion.",
    "",
    "This release includes macOS Intel, macOS Apple Silicon, Windows installer, and Windows portable builds.",
  ].join("\n");
}

function main() {
  validateEnvironment();
  const artifacts = collectArtifacts();
  const releaseExists = run("gh", ["release", "view", tag], {
    capture: true,
    allowFailure: true,
  }).status === 0;

  const commandArgs = releaseExists
    ? ["release", "upload", tag, ...artifacts, "--clobber"]
    : [
        "release",
        "create",
        tag,
        ...artifacts,
        "--title",
        `Tyria Ledger ${version}`,
        "--notes",
        getReleaseNotes(),
      ];

  if (dryRun) {
    console.log(`${releaseExists ? "Would update" : "Would create"} GitHub release ${tag}`);
    artifacts.forEach((artifact) => console.log(`- ${path.relative(root, artifact)}`));
    return;
  }

  run("gh", commandArgs);
  console.log(`${releaseExists ? "Updated" : "Created"} GitHub release ${tag}`);
}

main();
