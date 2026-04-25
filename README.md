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


## Demo

The bunq sandbox is pre-seeded with 11 recipients. All IBANs are real sandbox accounts and accept transfers from the main account (`NL27BUNQ2106261071`).

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
| 9 | Derick Wickham | `NL58BUNQ2106268661` | Freelance invoice |
| 10 | Folkert Hardy | `NL51BUNQ2106262191` | Car repair |
| 11 | **Andre Hart** *(flagged)* | `NL21BUNQ2106250509` | Marketplace deposit |

> The legal account-holder name shown on bunq receipts is fixed by the sandbox (it draws from a bunq-approved pool). The display labels above are what your demo presents to the user.

### Low-risk vs High-risk scenarios

The app combines two risk layers: a **local Finn scan** that runs in the browser when you click _Add payment_, and the **Warden** (Claude-powered) check you launch from the orange button or the flagged-payment alert.

#### Pay flow → expected to be **clear**

| IBAN | Amount | Description | Why it stays clear |
|---|---|---|---|
| `NL29BUNQ2106257058` | `EUR 24.50` | `Splitting dinner` | Legit IBAN, low amount, no scam keywords |
| `NL54BUNQ2106266987` | `EUR 850.00` | `April rent` | Legit IBAN, no urgency or marketplace context |
| `NL51BUNQ2106262191` | `EUR 320.00` | `Brake pad replacement` | Service context, reasonable amount |

#### Pay flow → expected to be **flagged**

| IBAN | Amount | Description | Why Finn flags it |
|---|---|---|---|
| `NL21BUNQ2106250509` | any | any | IBAN is on the local fraud list (Andre Hart) |
| any legit IBAN | `EUR 1,500.00` | `Marketplace deposit` | High first transfer + scam keyword (`marketplace`) |
| any legit IBAN | `EUR 2,400.00` | `Urgent escrow for crypto` | High amount + multiple scam keywords |

You can also click **Fill flagged demo (Andre Hart)** in the Add Payment modal to load the canonical flagged scenario in one tap. Flagged payments never leave the sandbox account — they sit in the Warden queue for review.

#### Warden self-check (orange "Check this" button) → expected **Low risk** / `legitimate_consistent_evidence`

Upload a screenshot or PDF that includes:
- A real-looking IBAN (one of the legit recipients above)
- A consistent merchant name across invoice and account holder
- A reasonable amount and clear purpose (rent, repair, freelance invoice)
- Optional: a WhatsApp screenshot where the IBAN matches the invoice

Sample text to paste:
> _"Just paid the April rent for my room. Invoice from Eindhoven Student Housing B.V., IBAN NL54BUNQ2106266987, EUR 850.00. They sent the same details over WhatsApp last month and I've paid them every month for a year."_

#### Warden self-check → expected **High risk** / `scam_identified`

Any one of these alone is enough to trigger High:
- IBAN is all zeros or clearly invalid (e.g. `NL00 BUNQ 0000 0000 00`)
- KvK / VAT / EIN registration number is all zeros or `123456789`
- Email domain ends in `.example`, `.test`, `.invalid`, or `.localhost`
- Invoice contains a small "adjustment" or "fee" line item (e.g. `EUR 1.00`) mixed with a large total
- Document explicitly labels itself as synthetic, a test, or a sample
- Sender name, IBAN beneficiary name, and invoice company name don't match each other

Sample text to paste:
> _"I got an invoice on WhatsApp from someone calling themselves CryptoEscrow Ltd, IBAN NL00 BUNQ 0000 0000 00, KvK 000000000, billing@example.example. They want EUR 4,200.00 plus a EUR 1.00 'verification fee' urgently to release my deposit."_

### Sandbox top-up

The main account starts at €0. Click the **Sandbox +€500** pill on the balance hero (visible only when the bunq API is reachable) to request funds from `sugardaddy@bunq.com`. Repeat as needed.
