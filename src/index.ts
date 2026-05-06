#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleAuditTool } from "./tools/audit.js";

const server = new McpServer({
  name: "top-gun-geo-lens",
  version: "1.0.0",
});

server.tool(
  "audit_brand",
  "Audit brand or product visibility across LLM-indexed sources. " +
    "Returns a visibility score (0–100), citation URLs, LLM index status, " +
    "and actionable GEO recommendations. Costs $1.50 USDC per audit.",
  {
    query: z
      .string()
      .min(1)
      .describe("Brand name, company, or product to audit (e.g. 'Anthropic', 'Linear', 'Vercel')"),
    paymentToken: z
      .string()
      .optional()
      .describe(
        "Stripe checkout session ID from a completed $1.50 USDC payment. " +
          "If omitted, the tool returns a payment link instead of audit results."
      ),
  },
  async ({ query, paymentToken }) => {
    const text = await handleAuditTool({ query, paymentToken });
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "get_payment_info",
  "Get the payment URL and USDC wallet address needed to pay for a brand audit.",
  {},
  async () => {
    const paymentUrl = process.env["STRIPE_PAYMENT_URL"] ?? "(not configured)";
    const wallet = process.env["USDC_WALLET_ADDRESS"] ?? "(not configured)";

    const text = [
      "## TOP GUN Audit Payment",
      "",
      `**Cost:** $1.50 USDC per audit`,
      `**Payment URL:** ${paymentUrl}`,
      `**USDC Wallet:** \`${wallet}\``,
      "",
      "After payment, use the Stripe session ID as `paymentToken` in `audit_brand`.",
    ].join("\n");

    return { content: [{ type: "text", text }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[top-gun-mcp] Server running on stdio");
}

main().catch((err) => {
  console.error("[top-gun-mcp] Fatal error:", err);
  process.exit(1);
});
