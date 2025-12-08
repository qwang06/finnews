# Setup script for FinNews API
# Creates virtual environment and installs dependencies

Write-Host "Setting up FinNews API..." -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Display Python version
$pythonVersion = py --version
Write-Host "Using $pythonVersion" -ForegroundColor Green

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    py -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created successfully" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
py -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
py -m pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSetup completed successfully!" -ForegroundColor Green
    Write-Host "`nTo activate the virtual environment, run:" -ForegroundColor Cyan
    Write-Host "  .\.\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "`nTo start the API server, run:" -ForegroundColor Cyan
    Write-Host "  nx serve api" -ForegroundColor White
    Write-Host "  or" -ForegroundColor White
    Write-Host "  py -m uvicorn main:app --reload" -ForegroundColor White
} else {
    Write-Host "`nSetup failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
