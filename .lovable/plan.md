# Connect to Ben-Grob/AI502-Project-Two

You asked for both: (1) pull the architecture docs into this project, and (2) set up Git sync. Here's how I'll handle each.

## 1. Pull the architecture docs into the project

The repo has 5 markdown files at its root:
- `architecture.md`
- `copilot-instructions.md`
- `development-checklist.md`
- `evaluation.md`
- `prd.md`

I'll download all 5 from the `main` branch (raw GitHub) and save them into a new `docs/` folder in this project so they live alongside the code and can be referenced while building:

```text
docs/
  architecture.md
  copilot-instructions.md
  development-checklist.md
  evaluation.md
  prd.md
```

These will be static reference files (not bundled into the app). If you later want the running app to read/display them, that's a separate feature we can add (e.g., a `/docs` route that renders them).

## 2. Set up Git sync (you'll do this part in the UI)

Git sync between Lovable and a GitHub repo is configured through Lovable's GitHub integration, not via a code change I can make. Steps:

1. In the Lovable editor, click **GitHub** (top-right area) → **Connect to GitHub**.
2. Authorize the Lovable GitHub App for your account/org `Ben-Grob`.
3. Choose **Create new repository** *or* **Connect existing repository**.
   - Connecting to the existing `AI502-Project-Two` repo will merge this Lovable project's code into that repo (the docs already there will be preserved, since we're also adding them under `docs/` here).
   - Alternatively, create a separate new repo for the app code and keep `AI502-Project-Two` as docs-only.

After connecting, every change in Lovable auto-commits to GitHub, and pushes to the connected branch flow back into Lovable.

## Recommendation

Use `AI502-Project-Two` as a **docs-only** reference repo and create a **new** repo (e.g., `gvsu-sponsor-outreach-app`) for the Lovable app code. Reason: mixing a Vite/React app into a repo that's currently just planning docs can be messy, and keeps the architecture docs as a clean source of truth.

## What I'll do when you approve

- Create `docs/` folder
- Download the 5 .md files from the GitHub raw URLs and save them into `docs/`
- Reply with confirmation and next steps for the GitHub UI connection

Nothing about the running app UI changes.