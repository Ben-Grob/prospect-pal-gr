import { createFileRoute } from "@tanstack/react-router";
import SponsorOutreachAgent from "@/components/SponsorOutreachAgent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GVSU Sponsor Outreach Agent" },
      { name: "description", content: "Find local sponsors and draft outreach emails for GVSU Men's Club Soccer." },
      { property: "og:title", content: "GVSU Sponsor Outreach Agent" },
      { property: "og:description", content: "Find local sponsors and draft outreach emails for GVSU Men's Club Soccer." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main style={{ minHeight: "100vh", padding: "0 1rem" }}>
      <SponsorOutreachAgent />
    </main>
  );
}
