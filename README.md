# HackathonBunq7.0

Local demo with a React/Vite frontend and FastAPI backend, launched with Docker Compose. The application does use the Bunq API.

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

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`

Stop the stack:

```powershell
docker compose down
```

## Notes

- Do not commit `backend/.env`; it contains secrets and is ignored by git.
