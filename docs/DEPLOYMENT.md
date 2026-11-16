# Deploying SocialOps

The repo ships Dockerfiles for the API, agent and web app, so any host that runs containers works
(a single VM with docker compose is the simplest start). `docker-compose.yml` is the **local** stack:
it runs in Development mode with sample data, a well-known API key and the sandbox sender, so do not
expose it to the internet as is.

## Settings that must change for a real deployment

| Setting | Why |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT=Production` | Turns off sample data and the development API key in `appsettings.Development.json`. |
| `Database__MigrateOnStartup=true` | Applies migrations on startup (Production does not do this by default). Fine for one API instance. |
| `ConnectionStrings__DefaultConnection` | Point at a managed Postgres with a strong password. |
| `Authentication__ApiKey__Keys__0__Key`, `__OrganizationId`, `__Role` | Real API keys, one per client. Generate long random values. |
| `Cors__AllowedOrigins` | Your web app's public origin, e.g. `https://app.example.com`. |
| `Webhooks__EnableSandbox` | Leave unset or `false`. The sandbox webhook is anonymous. |
| `Outbound__UseSandbox` | Leave unset or `false`. |
| `Instagram__*` | See `docs/INSTAGRAM_SETUP.md`. |
| Agent: `GROQ_API_KEY`, `SOCIALOPS_API_KEY` | `SOCIALOPS_API_KEY` must match one of the API keys above (role Agent or higher). |
| Web build args `VITE_API_URL`, `VITE_API_KEY`, `VITE_ORGANIZATION_ID` | Baked into the bundle at build time. |

## Things to fix before real customers use it

- **The web app embeds an API key.** Anything in a browser bundle is public. Use a key that can only
  do what an operator should, and treat this as temporary: the proper fix is user login (JWT) so the
  browser never holds a shared secret.
- **The agent has no authentication of its own.** Keep it on a private network, reachable only by the API.
- **Secrets**: provide them through your host's secret store or environment, never commit them. `.env`
  is git-ignored.
- **TLS**: put the API and web app behind HTTPS (a reverse proxy such as Caddy or nginx, or your host's
  load balancer). The Instagram webhook requires it.
- **Backups**: the Postgres volume holds everything. Schedule backups.
