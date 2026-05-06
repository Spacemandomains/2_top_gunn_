import { searchBrave } from "./brave.js";
import { searchExa } from "./exa.js";
import { scoreResults } from "./scorer.js";
import type { AuditResult, SearchResult } from "./types.js";

export interface AuditConfig {
  braveApiKey?: string;
  exaApiKey?: string;
}

export async function runAudit(
  query: string,
  config: AuditConfig
): Promise<AuditResult> {
  if (!config.braveApiKey && !config.exaApiKey) {
    throw new Error(
      "At least one search API key is required: BRAVE_SEARCH_API_KEY or EXA_API_KEY"
    );
  }

  const searchJobs: Promise<SearchResult[]>[] = [];

  if (config.braveApiKey) {
    searchJobs.push(
      searchBrave(query, config.braveApiKey).catch((err) => {
        console.error("[brave] search failed:", err.message);
        return [];
      })
    );
  }

  if (config.exaApiKey) {
    searchJobs.push(
      searchExa(query, config.exaApiKey).catch((err) => {
        console.error("[exa] search failed:", err.message);
        return [];
      })
    );
  }

  const resultGroups = await Promise.all(searchJobs);
  const allResults = deduplicateByUrl(resultGroups.flat());

  return scoreResults(query, allResults);
}

function deduplicateByUrl(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}
