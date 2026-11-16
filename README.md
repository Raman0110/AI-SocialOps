# AI SocialOps

AI SocialOps is a multi-tenant customer-operations platform that brings social conversations into a
unified inbox. It combines human support workflows with an auditable tool-calling AI agent that can
analyze messages, retrieve trusted business knowledge, draft replies, and propose operational actions.
Sensitive actions remain under application policy and human approval.

## Core capabilities

- Unified inbox with conversation history, filters, delivery status, and retry support
- Customer profiles linked to platform-specific social identities
- Organization-owned social accounts and tenant-scoped data access
- Idempotent inbound webhook processing and pluggable outbound senders
- Intent, sentiment, priority, risk, and confidence analysis
- Knowledge-grounded reply generation using organization-specific FAQs and policies
- Tool-calling agent with customer context, conversation history, and knowledge search
- Human approval or rejection of proposed support-ticket actions
- Persistent agent runs and individual tool-execution audit records
- API-key authentication, tenant isolation, and role-based authorization
- Development sandbox workflows for repeatable end-to-end validation

## Architecture

```text
Social platform / sandbox webhook
              |
              v
React web app ---> ASP.NET Core API ---> PostgreSQL
                         |   ^
                         v   | trusted tool calls
                  Python FastAPI agent ---> Groq LLM
```

The API is the business authority and system-of-record boundary. The Python service owns prompts,
model calls, and agent orchestration, but it never accesses PostgreSQL directly. It can read trusted
context or propose actions only through authenticated API tools.

## Technology

| Area | Stack |
| --- | --- |
| Web | React, TypeScript, Vite, Ant Design, Tailwind CSS |
| API | .NET 10, ASP.NET Core, Entity Framework Core, FluentValidation |
| Agent | Python, FastAPI, Pydantic, Groq tool calling |
| Data | PostgreSQL, pgvector-ready image |
| Testing | xUnit, ASP.NET integration tests, Pytest, Vitest, React Testing Library, MSW |
| Runtime | Docker, Docker Compose |

## Repository layout

| Path | Responsibility |
| --- | --- |
| `apps/api` | Tenant-aware business API, persistence, webhooks, approvals, and agent tools |
| `apps/agent` | LLM integration, prompts, tool loop, and behavior evaluations |
| `apps/web` | Operations dashboard, inbox, customers, knowledge, AI actions, and agent runs |
| `tests/SocialOps.Api.Tests` | API integration, authorization, isolation, webhook, and delivery tests |
| `scripts` | Full-stack smoke test and development-data reset commands |
| `docs` | Local setup, deployment guidance, and Instagram configuration |

## Quick start with Docker

Prerequisites: Docker Desktop and a [Groq API key](https://console.groq.com/).

```powershell
copy .env.example .env
# Set GROQ_API_KEY in .env
docker compose up --build
```

| Service | URL |
| --- | --- |
| Web application | http://localhost:5173 |
| API and Swagger | http://localhost:8080/swagger |
| Agent API | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

The Development environment applies migrations and seeds the UrbanThreads sample organization.
Replies use the sandbox sender unless Instagram credentials are configured.

Run the end-to-end receive, reason, and reply workflow:

```powershell
./scripts/smoke-test.ps1
```

Restore the original seeded dataset at any time:

```powershell
./scripts/reset-development-data.ps1
```

For running services directly during development, see [docs/LOCAL_RUN.md](docs/LOCAL_RUN.md).

## Main workflow

1. An inbound webhook is verified or accepted by the Development sandbox adapter.
2. The API resolves the organization account and finds or creates the customer identity.
3. The conversation and message are stored with external-message idempotency.
4. The operator can request analysis or a context-aware agent reply.
5. The agent retrieves trusted context through authorized API tools.
6. Write operations become pending actions instead of executing immediately.
7. A human approves or rejects the action.
8. Messages, delivery attempts, agent runs, and tool executions remain auditable.

## Security model

Development uses API-key identities containing organization and role claims. Authorization policies
separate reader, operator, and administrator capabilities, while tenant-owned queries enforce the
authenticated organization. Internal agent-tool endpoints require an operator identity. The sandbox
webhook and development-data reset endpoint are disabled outside explicitly configured environments.

The browser currently receives a development API key at build time. Replace this with user login and
short-lived JWT or session authentication before serving real users.

## Tests

```powershell
# ASP.NET API integration tests
dotnet test tests/SocialOps.Api.Tests

# Python agent unit tests and offline evaluation checks
cd apps/agent
.venv\Scripts\python -m pytest

# React component and API integration tests
cd ../web
npm test

# Live-model behavior evaluations (requires GROQ_API_KEY)
cd ../agent
python -m evals.run
```

The test suite covers authentication, tenant isolation, webhook idempotency, outbound delivery,
knowledge isolation, agent tools, approval workflows, UI integrations, and agent behavior rules.

## Documentation

- [Local development](docs/LOCAL_RUN.md)
- [Instagram configuration](docs/INSTAGRAM_SETUP.md)
- [Deployment guidance](docs/DEPLOYMENT.md)

## Current scope

The repository provides a complete application prototype and sandbox workflow. Production adoption
still requires browser user authentication, managed secrets, HTTPS, database backups, background job
processing for long-running work, and production observability.
