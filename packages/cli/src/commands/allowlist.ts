import { apiRequest } from "../client.js";

interface AllowlistEntry {
  id: string;
  domain: string;
  createdAt: string;
}

const USAGE = `
Usage:
  onecli allowlist list   <agentId>
  onecli allowlist add    <agentId> <domain>
  onecli allowlist remove <agentId> <entryId>

Environment variables:
  ONECLI_API_URL     Base URL of the OneCLI API  (e.g. http://localhost:3001)
  ONECLI_API_KEY     API key (oc_* or oc_org_*)
  ONECLI_PROJECT_ID  Project ID

Examples:
  onecli allowlist list   ag_abc123
  onecli allowlist add    ag_abc123 api.openai.com
  onecli allowlist add    ag_abc123 "*.anthropic.com"
  onecli allowlist remove ag_abc123 <entry-id>
`.trim();

export const allowlistCommand = async (args: string[]): Promise<void> => {
  const [subcommand, agentId, extra] = args;

  if (!subcommand || !agentId) {
    console.error(USAGE);
    process.exit(1);
  }

  const base = `/v1/agents/${agentId}/allowlist`;

  switch (subcommand) {
    case "list": {
      const entries = await apiRequest<AllowlistEntry[]>("GET", base);
      if (entries.length === 0) {
        console.log("No allowlist entries — all outbound domains are allowed.");
      } else {
        for (const e of entries) {
          console.log(`${e.id}\t${e.domain}`);
        }
      }
      break;
    }

    case "add": {
      const domain = extra?.trim();
      if (!domain) {
        console.error("Error: domain is required\n\n" + USAGE);
        process.exit(1);
      }
      const entry = await apiRequest<AllowlistEntry>("POST", base, { domain });
      console.log(`Added: ${entry.id}\t${entry.domain}`);
      break;
    }

    case "remove": {
      const entryId = extra?.trim();
      if (!entryId) {
        console.error("Error: entryId is required\n\n" + USAGE);
        process.exit(1);
      }
      await apiRequest<void>("DELETE", `${base}/${entryId}`);
      console.log(`Removed entry ${entryId}`);
      break;
    }

    default:
      console.error(`Unknown subcommand: ${subcommand}\n\n${USAGE}`);
      process.exit(1);
  }
};
