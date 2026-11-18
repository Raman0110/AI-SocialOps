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
| `Authentication__Jwt__SigningKey` | At least 32 random bytes used to sign user access tokens. Never use the development value. |
| `Authentication__Jwt__Issuer`, `__Audience`, `__AccessTokenMinutes` | JWT validation and lifetime settings. |
| `Authentication__ApiKey__Keys__0__Key`, `__OrganizationId`, `__Role` | Machine credential for the Python agent. Use Agent role and a long random value. |
| `Cors__AllowedOrigins` | Your web app's public origin, e.g. `https://app.example.com`. |
| `Webhooks__EnableSandbox` | Leave unset or `false`. The sandbox webhook is anonymous. |
| `Outbound__UseSandbox` | Leave unset or `false`. |
| `Instagram__*` | See `docs/INSTAGRAM_SETUP.md`. |
| Agent: `GROQ_API_KEY`, `SOCIALOPS_API_KEY` | `SOCIALOPS_API_KEY` must match one of the API keys above (role Agent or higher). |
| Web build arg `VITE_API_URL` | Public API URL baked into the web bundle. No credential is embedded. |

## Things to fix before real customers use it

- **Session hardening:** user login uses short-lived JWT access tokens. Add refresh-token rotation or
  secure server-managed sessions, account recovery, and login throttling before serving real users.
- **The agent has no authentication of its own.** Keep it on a private network, reachable only by the API.
- **Secrets**: provide them through your host's secret store or environment, never commit them. `.env`
  is git-ignored.
- **TLS**: put the API and web app behind HTTPS (a reverse proxy such as Caddy or nginx, or your host's
  load balancer). The Instagram webhook requires it.
- **Backups**: the Postgres volume holds everything. Schedule backups.
