#!/usr/bin/env node
import { allowlistCommand } from "./commands/allowlist.js";

const USAGE = `
OneCLI command-line tool

Usage:
  onecli <command> [subcommand] [args...]

Commands:
  allowlist   Manage per-agent domain allowlists

Run "onecli <command>" without arguments for command-specific help.
`.trim();

const [, , command, ...rest] = process.argv;

if (!command || command === "--help" || command === "-h") {
  console.log(USAGE);
  process.exit(0);
}

const run = async () => {
  switch (command) {
    case "allowlist":
      await allowlistCommand(rest);
      break;
    default:
      console.error(`Unknown command: ${command}\n\n${USAGE}`);
      process.exit(1);
  }
};

run().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
});
