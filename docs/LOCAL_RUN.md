# Running SocialOps locally

Four pieces run together: Postgres, the API (.NET), the agent (Python), and the web app (React).
Only Postgres and the agent have Docker support today, so the API and web run directly.

## Prerequisites

- .NET 10 SDK, Python 3.12+, Node 20+, Docker
- A Groq API key (https://console.groq.com)

## 1. Postgres

```powershell
docker compose up -d postgres
```

The compose database uses user `socialops`, password `socialops`. The API's
`appsettings.Development.json` expects `postgres` / `password`, so pass the compose
credentials through an environment variable when you start the API (below) instead of
editing the file.

## 2. API (http://localhost:8080)

```powershell
cd apps/api
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Port=5432;Database=socialops;Username=socialops;Password=socialops"
dotnet run
```

In Development it applies migrations and seeds the UrbanThreads demo organization on startup.
The outbound sandbox sender is on (`Outbound:UseSandbox`), so replies are marked `Sent`
without reaching Instagram.

## 3. Agent (http://localhost:8000)

```powershell
cd apps/agent
.venv\Scripts\activate
$env:GROQ_API_KEY = "<your key>"
$env:SOCIALOPS_API_KEY = "dev-api-key"
fastapi dev app/main.py
```

`SOCIALOPS_API_KEY` is the key the agent sends when it calls the API's agent tools.
Without it every tool call fails with 401.

## 4. Web (http://localhost:5173)

```powershell
cd apps/web
copy .env.example .env   # first time only
npm install              # first time only
npm run dev
```

## 5. Smoke test

```powershell
./scripts/smoke-test.ps1
```

It adds a sample refund-policy knowledge entry, posts a customer message through the
sandbox webhook, asks the agent for a draft, sends it, and prints each step. Then open the
inbox and look at the conversation with `smoke.customer`.

## Reset the interview demo

Before a presentation, restore the UrbanThreads data to the same known state:

```powershell
./scripts/reset-demo.ps1
```

This restores four customers and conversations, three business knowledge entries, pending
AI actions and an audited agent run. The endpoint is protected by the development Owner key,
is restricted to the demo organization, and returns 404 outside the Development environment.

## What to look for

| Check | Good | Bad |
| --- | --- | --- |
| Agent used the knowledge base | `Tools used` includes `search_knowledge` | Empty tools list on a policy question |
| Draft matches the policy | Mentions 7 days / original condition | Invents details |
| Delivery | `Sent` | `Failed` with a reason, or a 4xx/5xx from the script |

If the agent step fails: 401 means `SOCIALOPS_API_KEY` is missing, 502 means Groq rejected
the request (check `GROQ_API_KEY` and the model name in `apps/agent/app/config/settings.py`).

## Agent evaluation (needs only a Groq key)

The smoke test checks that the pieces connect. The evals check that the agent *behaves*:
does it search the knowledge base, avoid claiming actions it did not take, escalate damaged
items, resist prompt injection, and stay on the right conversation. They run against a fixed
sample business with a fake API, so no database or running API is needed.

```powershell
cd apps/agent
.venv\Scripts\activate
$env:GROQ_API_KEY = "<your key>"
python -m evals.run                    # every case once
python -m evals.run --repeat 3         # models vary run to run; repeat to see flakiness
python -m evals.run --case refund-policy
```

Cases live in `apps/agent/evals/cases.json`. Add a case whenever you see the agent do something
wrong with a real conversation, then fix the prompt until it passes. Re-run after any prompt or
model change. The checks themselves are unit-tested (`pytest`) and run offline.
