# HackathonBunq7.0

Local demo with a React/Vite frontend and FastAPI backend, launched with Docker Compose.

## Prerequisites

- Docker Desktop
- Anthropic API key

## Run

Create `backend/.env` first:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

Start both services:

```powershell
docker compose up --build
```

Open the app at:

```text
http://localhost:15173
```
Backend docs:

```text
http://127.0.0.1:18000/docs
```

Stop the stack:

```powershell
docker compose down
```

## Notes

- The frontend is configured to call `http://127.0.0.1:18000`.
- If you change the backend host port in `docker-compose.yml`, also update `VITE_API_URL`.
- Do not commit `backend/.env`; it contains secrets and is ignored by git.