# Feedback → GitHub issue: Cloudflare Worker setup

The in-app **Submit** button sends beta feedback straight to GitHub Issues so the
reporter never leaves PlanToGuide. Because a public static site can't safely hold a
GitHub write token, a tiny **Cloudflare Worker** ([`feedback-worker.js`](feedback-worker.js))
holds the token as a secret and creates the issue. One-time setup, ~5 minutes:

## 1. Create a GitHub token (fine-grained, minimal scope)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Resource owner:** `christopher-013`. **Repository access:** *Only select repositories* → `PlanToGuide`.
3. **Permissions → Repository permissions → Issues:** *Read and write*. (Nothing else is needed.)
4. Generate and copy the token (starts with `github_pat_…`). Treat it like a password.

## 2. Deploy the Worker

**Dashboard route (no CLI):**
1. Cloudflare dashboard → **Workers & Pages → Create → Create Worker**.
2. Name it e.g. `plantoguide-feedback`. Deploy the starter, then **Edit code**.
3. Replace the code with the contents of [`feedback-worker.js`](feedback-worker.js) and **Deploy**.
4. Copy the Worker URL it shows, e.g. `https://plantoguide-feedback.<your-subdomain>.workers.dev`.

**Or CLI:** `npx wrangler deploy feedback-worker.js --name plantoguide-feedback`

## 3. Add the token as a Worker secret

- Dashboard: Worker → **Settings → Variables and Secrets → Add → Secret**, name **`GITHUB_TOKEN`**, paste the token, **Save and deploy**.
- Or CLI: `npx wrangler secret put GITHUB_TOKEN` and paste when prompted.

Optional variables (plain text, not secret):
- `GITHUB_REPO` — defaults to `christopher-013/PlanToGuide`.
- `ALLOWED_ORIGINS` — comma-separated origins allowed to submit. Defaults to the
  PlanToGuide Pages site plus `localhost:8767`/`127.0.0.1:8767` for local testing.

## 4. Point the app at the Worker

In [`beta-tools.js`](beta-tools.js), set:

```js
var FEEDBACK_ENDPOINT = "https://plantoguide-feedback.<your-subdomain>.workers.dev";
```

Commit and push. The CSP already allows `https://*.workers.dev`, so it works once the
URL is set. (If you later put the Worker on a custom domain, add that host to the
`connect-src` list in `index.html`.)

## How it behaves

- **Endpoint set:** Submit POSTs the feedback to the Worker, which opens a GitHub issue
  labeled `feedback,beta`. The reporter sees only a "Thank you" — no GitHub, no sign-in.
- **Endpoint empty or unreachable:** the form falls back to opening a pre-filled GitHub
  issue so a note is never lost.

## Notes / hardening

- The token lives only in the Worker's secret store; it is never in the site, the repo,
  or the browser.
- The Worker checks the request `Origin` against the allowlist as light anti-abuse. For a
  busier beta, add **Cloudflare Turnstile** (a free CAPTCHA) in front of the form and verify
  the token in the Worker before creating the issue.
- The Worker validates and length-caps every field before calling GitHub.
