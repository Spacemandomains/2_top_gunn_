import type { SearchResult } from "./types.js";

const EXA_API_BASE = "https://api.exa.ai/search";

export async function searchExa(
  query: string,
  apiKey: string
): Promise<SearchResult[]> {
  const res = await fetch(EXA_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults: 10,
      useAutoprompt: true,
      type: "neural",
      contents: { snippet: { maxCharacters: 300 } },
    }),
  });

  if (!res.ok) {
    throw new Error(`Exa Search error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ExaResponse;
  const results: SearchResult[] = [];

  for (const item of data.results ?? []) {
    results.push({
      url: item.url,
      title: item.title ?? item.url,
      description: item.snippet ?? "",
      source: "exa",
    });
  }

  return results;
}

interface ExaResponse {
  results: Array<{
    url: string;
    title?: string;
    snippet?: string;
  }>;
}
