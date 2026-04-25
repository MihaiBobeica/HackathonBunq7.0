# Warden Backend

FastAPI backend for the Warden fraud-prevention demo on top of bunq sandbox + Claude.

## One-time setup (Windows / PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Then copy `.env.example` -> `.env` and fill in keys. The repo's `.env` is gitignored.

## Run

```powershell
.\run.ps1
```

Server listens on http://localhost:8000. Confirm with:

```powershell
curl http://localhost:8000/api/health
```

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | `/api/health`         | liveness + bunq/Anthropic status |
| GET    | `/api/accounts`       | list bunq monetary accounts |
| GET    | `/api/transactions`   | list recent payments |
| GET    | `/api/iban-check`     | counterparty history + risk signals |
| POST   | `/api/analyze`        | multimodal Claude analysis (multipart) |
| POST   | `/api/draft-payment`  | create a sandbox draft payment (stub) |
| POST   | `/api/bunq-webhook`   | bunq -> backend webhook receiver |
| POST   | `/payment`            | legacy simple payment (kept for compat) |
| POST   | `/scam-check`         | legacy scam check (delegates to /api/analyze) |

All endpoints degrade gracefully: if bunq context fails to initialize they
return mock-shaped data with `fallback: true`. If Anthropic is unavailable
`/api/analyze` returns a canned medium-risk result with `fallback: true`.
