# Warden

A multimodal fraud-prevention prototype for banking payments, built for bunq Hackathon 7.0.

Warden lets a user provide supporting evidence such as screenshots, invoices, chat logs, or PDFs before completing a suspicious payment. The system analyzes the evidence, explains the risk, and can hold flagged payments in a review queue instead of immediately sending them.

## What it does

- analyzes uploaded evidence with a multimodal LLM
- combines document evidence with payment context
- returns a structured risk verdict with reasons
- applies a fast local risk scan before the deeper AI check
- keeps flagged payments in a review flow
- integrates with the bunq sandbox API

## Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **AI:** Anthropic Claude
- **Banking:** bunq API
- **Deployment:** Docker Compose

## Run locally

### Prerequisites

- Docker Desktop
- Anthropic API key

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

Start the application:

```powershell
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`

Stop it with:

```powershell
docker compose down
```

Do not commit `backend/.env`; it contains secrets and is ignored by git.

## Demo

The bunq sandbox is pre-seeded with 11 recipients. All IBANs are sandbox accounts and accept transfers from the main account (`NL27BUNQ2106261071`).

### Recipients

| # | Display name | IBAN | Suggested use |
|---|---|---|---|
| 1 | Eindhoven Student Housing B.V. | `NL54BUNQ2106266987` | Rent payment |
| 2 | Julia Thompson | `NL29BUNQ2106257058` | Splitting dinner |
| 3 | Trevor Barr | `NL43BUNQ2106247591` | Repaying a loan |
| 4 | Jenna Bradley | `NL93BUNQ2106261241` | Concert tickets |
| 5 | Morgan Nixon | `NL56BUNQ2106267339` | Coffee run |
| 6 | Niels Cooper | `NL33BUNQ2106270372` | Birthday gift |
| 7 | Laura Sutherland | `NL96BUNQ2106264291` | Groceries |
| 8 | Val Haynes | `NL76BUNQ2106269404` | Utility bill |
| 9 | Derick Wickham | `NL58BUNQ2106257058` | Freelance invoice |
| 10 | Folkert Hardy | `NL51BUNQ2106257058` | Car repair |
| 11 | **Andre Hart** *(flagged)* | `NL21BUNQ2106250509` | Marketplace deposit |

> The legal account-holder name shown on bunq receipts is fixed by the sandbox. The display labels above are what the demo presents to the user.

### Risk layers

The app combines two checks:

1. **Finn** runs a lightweight local scan when a payment is added.
2. **Warden** performs the deeper Claude-powered evidence analysis.

### Example low-risk payments

| IBAN | Amount | Description | Why it stays clear |
|---|---|---|---|
| `NL29BUNQ2106257058` | `EUR 24.50` | `Splitting dinner` | Low amount and normal payment context |
| `NL54BUNQ2106266987` | `EUR 850.00` | `April rent` | Consistent rent context |
| `NL51BUNQ2106261241` | `EUR 320.00` | `Brake pad replacement` | Plausible service payment |

### Example flagged payments

| IBAN | Amount | Description | Why Finn flags it |
|---|---|---|---|
| `NL21BUNQ2106250509` | any | any | IBAN is on the local fraud list |
| any legit IBAN | `EUR 1,500.00` | `Marketplace deposit` | High first transfer + scam keyword |
| any legit IBAN | `EUR 2,400.00` | `Urgent escrow for crypto` | High amount + multiple scam keywords |

Flagged payments stay in the Warden queue for review rather than leaving the sandbox account.

### Multimodal self-check

For a low-risk test, upload evidence with:

- a valid-looking IBAN
- consistent merchant and beneficiary names
- a reasonable amount and purpose
- optional supporting chat evidence

For a high-risk test, use conflicting or obviously invalid details such as mismatched names, invalid registration numbers, suspicious domains, unusual fees, or explicitly synthetic documents.

Example documents are available in the `examples` folder.

### Sandbox top-up

The main account starts at EUR 0. Click **Sandbox +EUR 500** in the balance area to request sandbox funds from `sugardaddy@bunq.com`.
