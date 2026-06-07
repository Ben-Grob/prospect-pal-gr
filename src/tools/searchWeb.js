export async function searchBraveWeb(query, apiKey, size = 6) {
  const params = new URLSearchParams({ source: "web", q: query, size: String(size) });
  const res = await fetch(`https://api.search.brave.com/res/v1/web?${params.toString()}`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brave Search failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const results = (data?.web?.results ?? []).map((item) => ({
    title: item.title,
    snippet: item.snippet,
    url: item.url,
    source: item.source,
  }));
  return results;
}
