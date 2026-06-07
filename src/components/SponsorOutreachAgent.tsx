// @ts-nocheck
import { useState, useRef } from "react";
import { runOrchestrator } from "@/agents/orchestrator";

const AGENT_STEPS = [
  { id: "prospector", label: "Prospector", icon: "ti-search", desc: "Finding local businesses..." },
  { id: "researcher", label: "Researcher", icon: "ti-user-search", desc: "Enriching contact info..." },
  { id: "copywriter", label: "Copywriter", icon: "ti-pencil", desc: "Drafting personalized emails..." },
  { id: "reviewer", label: "Reviewer", icon: "ti-shield-check", desc: "Checking for errors..." },
  { id: "persona", label: "Persona Evaluator", icon: "ti-mood-smile", desc: "Scoring from owner's POV..." },
  { id: "orchestrator", label: "Orchestrator", icon: "ti-cpu", desc: "Assembling final output..." },
];

function ScoreDots({ score }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: i <= score ? "var(--color-text-success)" : "var(--color-border-tertiary)",
          display: "inline-block"
        }} />
      ))}
    </span>
  );
}

function ProspectCard({ email, review, evaluation, business }) {
  const [copied, setCopied] = useState(false);
  const isPassed = review?.status === "PASS";

  const copyEmail = () => {
    const full = `Subject: ${email.subject_line}\n\n${email.body}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: `0.5px solid ${isPassed ? "var(--color-border-success)" : "var(--color-border-warning)"}`,
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 500, fontSize: 15, margin: 0, color: "var(--color-text-primary)" }}>{business?.name}</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
            <i className="ti ti-map-pin" style={{ fontSize: 13, marginRight: 4 }} aria-hidden="true" />
            {business?.address} &nbsp;·&nbsp; {business?.type}
          </p>
          {business?.contact_name && (
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              <i className="ti ti-user" style={{ fontSize: 13, marginRight: 4 }} aria-hidden="true" />
              {business.contact_name} &nbsp;·&nbsp;
              <span style={{ color: "var(--color-text-info)" }}>{business.contact_email}</span>
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{
            fontSize: 12, padding: "3px 10px", borderRadius: "var(--border-radius-md)", fontWeight: 500,
            background: isPassed ? "var(--color-background-success)" : "var(--color-background-warning)",
            color: isPassed ? "var(--color-text-success)" : "var(--color-text-warning)",
          }}>
            {isPassed ? "✓ Pass" : "⚠ Flagged"}
          </span>
          {evaluation && <ScoreDots score={evaluation.score} />}
        </div>
      </div>

      {!isPassed && review?.reason && (
        <div style={{
          background: "var(--color-background-warning)", borderRadius: "var(--border-radius-md)",
          padding: "6px 10px", fontSize: 13, color: "var(--color-text-warning)", marginBottom: 10,
        }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 13, marginRight: 4 }} aria-hidden="true" />
          {review.reason}
        </div>
      )}

      {evaluation?.improvement && (
        <div style={{
          background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)",
          padding: "6px 10px", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10,
        }}>
          <i className="ti ti-bulb" style={{ fontSize: 13, marginRight: 4 }} aria-hidden="true" />
          {evaluation.improvement}
        </div>
      )}

      <div style={{
        background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)",
        padding: "10px 12px", marginBottom: 10,
      }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px", fontWeight: 500 }}>
          Subject: {email.subject_line}
        </p>
        <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {email.body}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copyEmail} style={{ fontSize: 13 }}>
          <i className="ti ti-copy" style={{ fontSize: 14, marginRight: 4 }} aria-hidden="true" />
          {copied ? "Copied!" : "Copy email"}
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", alignSelf: "center" }}>
          + attach ClubSoccerLetterTemplate.pdf when sending
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("Allendale, MI");
  const [agentStatus, setAgentStatus] = useState({});
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const setStatus = (id, status) => setAgentStatus(prev => ({ ...prev, [id]: status }));

  const runPipeline = async () => {
    if (!apiKey.trim()) { setError("Please enter your Anthropic API key."); return; }
    if (!category.trim()) { setError("Please enter a business category."); return; }
    setError(null);
    setResults(null);
    setAgentStatus({});
    setRunning(true);

    try {
      setStatus("orchestrator", "running");
      const assembled = await runOrchestrator(apiKey, category, location, setStatus);
      setStatus("orchestrator", "done");
      setResults(assembled);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Pipeline error: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  const downloadCSV = () => {
    if (!results) return;
    const rows = [["Business", "Contact Name", "Email", "Subject", "Body", "Status", "Score"]];
    results.forEach(({ email, business, review, evaluation }) => {
      rows.push([
        business.name || "", business.contact_name || "", business.contact_email || "",
        email.subject_line || "", (email.body || "").replace(/\n/g, " "),
        review.status || "", evaluation.score || ""
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sponsor-prospects.csv"; a.click();
  };

  const passCount = results?.filter(r => r.review.status === "PASS").length || 0;
  const avgScore = results ? Math.round(results.reduce((a, r) => a + (r.evaluation.score || 0), 0) / results.length * 10) / 10 : 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 0" }}>
      <h2 style={{ margin: "0 0 4px" }}>Sponsor Outreach Agent</h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 1.5rem" }}>
        GVSU Men's Club Soccer — Golf Outing Sponsorship
      </p>

      <div style={{
        background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 16,
      }}>
        <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Anthropic API key
        </label>
        <input
          type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
          placeholder="sk-ant-..." style={{ width: "100%", marginBottom: 12, fontFamily: "var(--font-mono)", fontSize: 13 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
              Business category
            </label>
            <input
              value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. restaurants, auto repair, dentists"
              style={{ width: "100%" }}
              onKeyDown={e => e.key === "Enter" && !running && runPipeline()}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
              Location
            </label>
            <input value={location} onChange={e => setLocation(e.target.value)} style={{ width: "100%" }} />
          </div>
        </div>
        <button onClick={runPipeline} disabled={running} style={{ width: "100%", fontSize: 14 }}>
          {running
            ? <><i className="ti ti-loader-2" style={{ fontSize: 14, marginRight: 6 }} aria-hidden="true" />Running pipeline...</>
            : <><i className="ti ti-player-play" style={{ fontSize: 14, marginRight: 6 }} aria-hidden="true" />Run agent pipeline</>
          }
        </button>
        {error && (
          <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: "8px 0 0" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 13, marginRight: 4 }} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {Object.keys(agentStatus).length > 0 && (
        <div style={{
          background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px", color: "var(--color-text-secondary)" }}>
            Pipeline status
          </p>
          {AGENT_STEPS.map(step => {
            const status = agentStatus[step.id];
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                  background: status === "done" ? "var(--color-background-success)" : status === "running" ? "var(--color-background-info)" : "var(--color-background-secondary)",
                  color: status === "done" ? "var(--color-text-success)" : status === "running" ? "var(--color-text-info)" : "var(--color-text-tertiary)",
                }}>
                  {status === "done" ? <i className="ti ti-check" aria-hidden="true" /> : status === "running" ? <i className="ti ti-loader-2" aria-hidden="true" /> : <i className="ti ti-minus" aria-hidden="true" />}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", minWidth: 140 }}>{step.label}</span>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                  {status === "running" ? step.desc : status === "done" ? "Complete" : "Waiting"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {results && (
        <div ref={resultsRef}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Prospects found", value: results.length },
              { label: "Passed review", value: `${passCount} / ${results.length}` },
              { label: "Avg persona score", value: `${avgScore} / 5` },
            ].map(m => (
              <div key={m.label} style={{
                background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)",
                padding: "0.75rem 1rem",
              }}>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{m.label}</p>
                <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>
              Results — {category} near {location}
            </p>
            <button onClick={downloadCSV} style={{ fontSize: 13 }}>
              <i className="ti ti-download" style={{ fontSize: 14, marginRight: 4 }} aria-hidden="true" />
              Download CSV
            </button>
          </div>

          {results.map((r, i) => (
            <ProspectCard key={i} email={r.email} review={r.review} evaluation={r.evaluation} business={r.business} />
          ))}
        </div>
      )}
    </div>
  );
}
