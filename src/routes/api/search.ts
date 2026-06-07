import { createFileRoute } from "@tanstack/react-router";
// @ts-ignore
import { searchBraveWeb } from "@/tools/searchWeb.js";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const query = body.query;
          const size = typeof body.size === "number" ? body.size : 6;
          const apiKey = process.env.BRAVE_SEARCH_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "Missing BRAVE_SEARCH_API_KEY on server" }),
              { status: 500, headers: { "content-type": "application/json" } },
            );
          }
          const results = await searchBraveWeb(query, apiKey, size);
          return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: err?.message ?? "Search failed" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});