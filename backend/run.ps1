# From backend/ directory
$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "Creating venv..."
    python -m venv venv
}

. .\venv\Scripts\Activate.ps1

pip install -q -r requirements.txt

python -m uvicorn main:app --reload --port 8000
