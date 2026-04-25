# HackathonBunq7.0

Local demo with a React/Vite frontend and FastAPI backend.

## Prerequisites

- Python 3.11+
- Node.js + npm
- Anthropic API key

## Backend

From the repo root:

```powershell
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

Start the backend:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API runs at `http://127.0.0.1:8000`.

## Frontend

In a second terminal:

```powershell
cd bunq-sentinel
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Useful Commands

Frontend lint:

```powershell
cd bunq-sentinel
npm run lint
```

Frontend build:

```powershell
cd bunq-sentinel
npm run build
```

Backend import check:

```powershell
cd backend
python -c "from main import app; print(app.title)"
```

## Notes

- The frontend calls `http://127.0.0.1:8000` by default.
- To use a different backend URL, set `VITE_API_URL` before starting Vite.
- Do not commit `backend/.env`; it contains secrets and is ignored by git.