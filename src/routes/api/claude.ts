// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/claude")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: { message: "Missing ANTHROPIC_API_KEY on server" } }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        const body = await request.text();
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body,
        });

        const text = await upstream.text();
        return new Response(text, {
          status: upstream.status,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});