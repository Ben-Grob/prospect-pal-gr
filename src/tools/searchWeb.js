export async function searchBraveWeb(query, apiKey, count = 6) {
  const params = new URLSearchParams({ q: query, count: String(count) });
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params.toString()}`, {
    headers: {
      "X-Subscription-Token": apiKey,
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brave Search failed (${res.status}): ${body}`);
  }

  const data = await res.json();

  if (import.meta.env.DEV) {
    console.log(`[Brave] ${data?.web?.results?.length ?? 0} results for "${query}"`);
  }

  return (data?.web?.results ?? []).map((item) => ({
    title: item.title,
    snippet: item.description ?? item.snippet,
    url: item.url,
    source: item.source,
  }));
}