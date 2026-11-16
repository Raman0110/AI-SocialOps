# SocialOps

An AI-assisted inbox for businesses that handle customer messages on social media (Instagram DMs
first). Messages arrive through a webhook, an AI agent drafts replies using the business's own FAQs and
policies, a human reviews and sends them, and every agent run is recorded. The agent can only *propose*
actions such as opening a support ticket; a person approves them.

```
Instagram -> webhook -> API (.NET) <-> Postgres
                          |   ^
              draft reply |   | tool calls (customer, history, knowledge, ticket proposals)
                          v   |
                       Agent (Python + Groq)        Web app (React) -> API
```

| Folder | What it is |
| --- | --- |
| `apps/api` | ASP.NET Core API: conversations, customers, knowledge base, agent runs and actions, webhooks, outbound sending, multi-tenant auth |
| `apps/agent` | FastAPI service running the tool-calling agent |
| `apps/web` | React + Vite inbox, knowledge base, agent runs and AI actions UI |
| `tests` | API integration tests |
| `scripts`, `docs` | Smoke test, run/deploy/Instagram guides |

## Quick start

```powershell
copy .env.example .env      # then set GROQ_API_KEY
docker compose up --build
```

Web app: http://localhost:5173 - API docs: http://localhost:8080/swagger - Agent: http://localhost:8000/docs

Then run `./scripts/smoke-test.ps1` to push a message through the whole loop. To run the pieces
without Docker (faster for development) see [docs/LOCAL_RUN.md](docs/LOCAL_RUN.md).

Before an interview demo, run `./scripts/reset-demo.ps1` to restore the seeded UrbanThreads
customers, conversations, knowledge, pending actions and agent audit data.

## Tests

```powershell
dotnet test tests/SocialOps.Api.Tests            # API: tenant isolation, auth, webhooks, sending
cd apps/agent; .venv\Scripts\python -m pytest    # agent loop, tools, eval tooling (offline)
cd apps/web; npm test                            # UI
cd apps/agent; python -m evals.run               # real-model behavior checks (needs GROQ_API_KEY)
```

## More

- [docs/LOCAL_RUN.md](docs/LOCAL_RUN.md): run locally, smoke test, agent evals
- [docs/INSTAGRAM_SETUP.md](docs/INSTAGRAM_SETUP.md): connect a real Instagram account
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): what to change before deploying
