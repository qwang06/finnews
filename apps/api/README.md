# FinNews API

Python backend API for the FinNews application.

## Overview

This FastAPI-based backend handles ticker symbol submissions from the frontend and will be enhanced to retrieve finance news and generate AI-powered reports.

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for running the application
- **Pydantic**: Data validation and settings management

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **First-time setup** (creates virtual environment and installs dependencies):
```bash
nx run api:setup
```

This will:
- Create a Python virtual environment in `apps/api/venv/`
- Upgrade pip to the latest version
- Install all required dependencies

2. **Install/Update dependencies** (if already set up):
```bash
nx run api:install
```

### Manual Setup (Alternative)

If you prefer to set up manually:

```powershell
cd apps/api

# Create virtual environment
py -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Upgrade pip
py -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

## Running the API

### Using Nx (Recommended)

```bash
nx serve api
```

### Manual Start

```powershell
cd apps/api

# Activate virtual environment first
.\venv\Scripts\Activate.ps1

# Run the server
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8725
```

The API will be available at `http://localhost:8725`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check

### Ticker Analysis
- `POST /api/ticker` - Submit a ticker symbol for analysis

**Request Body:**
```json
{
  "ticker": "AAPL"
}
```

**Response:**
```json
{
  "ticker": "AAPL",
  "message": "Successfully received ticker: AAPL",
  "news_summary": "News analysis for AAPL will be displayed here...",
  "status": "success"
}
```

## Development

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8725/docs`
- ReDoc: `http://localhost:8725/redoc`

## Future Enhancements

- [ ] Integrate finance news APIs
- [ ] Implement web scraping for news sources
- [ ] Add LLM integration for report generation
- [ ] Implement caching
- [ ] Add database for storing reports
- [ ] Enhance error handling and validation
