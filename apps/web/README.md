# AI SocialOps Web

React, TypeScript, Vite, Ant Design, and Tailwind frontend for AI SocialOps.

## Run locally

Copy `.env.example` to `.env.local`, then run `npm install` and `npm run dev`.

```env
VITE_API_URL=http://localhost:8080
VITE_USE_MOCKS=false
```

With live data enabled, sign in through the application. The browser stores the short-lived JWT session
and sends it as a Bearer token; no API key or organization identifier is embedded in the frontend build.
The active organization comes from the selected membership and changes when the user switches workspaces.

- `VITE_USE_MOCKS=false` uses the ASP.NET API.
- `VITE_USE_MOCKS=true` uses local mock data where a mock source is available.
- Restart Vite after changing environment variables.

Useful commands:

```powershell
npm run dev
npm test
npm run lint
npm run build
```
