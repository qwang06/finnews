"""
FastAPI backend for FinNews application.
Handles ticker symbol submissions and returns finance news reports.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os

from adapters.tiingo_adapter import TiingoClient
from adapters.github_adapter import GitHubAdapter
from db_config import db_config

# Load environment variables from .env file
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup
    try:
        db_config.initialize_pool(min_conn=2, max_conn=10)
        if db_config.test_connection():
            print("[OK] Database connection successful")
        else:
            print("[WARNING] Database connection test failed")
    except Exception as e:
        print(f"[WARNING] Database initialization error: {e}")
        print("API will start but database features may not work")

    yield

    # Shutdown
    db_config.close_pool()
    print("[OK] Database connections closed")
class TickerRequest(BaseModel):
    """Request model for ticker submissions."""
    ticker: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")


class TickerResponse(BaseModel):
    """Response model for ticker analysis."""
    ticker: str
    message: str
    status: str
    company_name: Optional[str] = None
    description: Optional[str] = None
    exchange: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    latest_price: Optional[Dict[str, Any]] = None


app = FastAPI(
    title="FinNews API",
    description="API for retrieving finance news and generating reports",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:4200",  # Alternative port
        "http://localhost:3000",  # Common dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "FinNews API is running",
        "version": "1.0.0"
    }


@app.post("/api/ticker", response_model=TickerResponse)
async def analyze_ticker(request: TickerRequest):
    """
    Analyze a ticker symbol and return company information and latest price.

    Fetches real-time data from Tiingo API including company metadata
    and the most recent price information.
    """
    ticker = request.ticker.upper()

    # Basic validation
    if not ticker.isalnum():
        raise HTTPException(
            status_code=400,
            detail="Ticker symbol must contain only letters and numbers"
        )

    try:
        # Initialize Tiingo client
        tiingo = TiingoClient()

        # Fetch ticker metadata
        metadata = tiingo.get_ticker_metadata(ticker)

        # Fetch latest price
        latest_price = tiingo.get_latest_price(ticker)

        return TickerResponse(
            ticker=ticker,
            message=f"Successfully retrieved data for {ticker}",
            status="success",
            company_name=metadata.get("name"),
            description=metadata.get("description"),
            exchange=metadata.get("exchangeCode"),
            start_date=metadata.get("startDate"),
            end_date=metadata.get("endDate"),
            latest_price=latest_price
        )

    except ValueError as e:
        # Handle invalid ticker or no data
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        # Handle API errors
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker data: {str(e)}"
        )


@app.get("/api/tickers/nasdaq", response_model=Dict[str, Any])
async def get_ticker_list():
    """
    Retrieve the list of valid ticker symbols from GitHub repository.

    Fetches the JSON file containing ticker symbols and their metadata.
    """
    try:
        github = GitHubAdapter()
        tickers_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="nasdaq/nasdaq_full_tickers.json"
        )

        return {
            "status": "success",
            "message": "Ticker list retrieved successfully",
            "data": tickers_data
        }

    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers/nyse", response_model=Dict[str, Any])
async def get_nyse_ticker_list():
    """
    Retrieve the list of valid NYSE ticker symbols from GitHub repository.

    Fetches the JSON file containing ticker symbols and their metadata.
    """
    try:
        github = GitHubAdapter()
        tickers_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="nyse/nyse_full_tickers.json"
        )

        return {
            "status": "success",
            "message": "Ticker list retrieved successfully",
            "data": tickers_data
        }

    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers/amex", response_model=Dict[str, Any])
async def get_amex_ticker_list():
    """
    Retrieve the list of valid AMEX ticker symbols from GitHub repository.

    Fetches the JSON file containing ticker symbols and their metadata.
    """
    try:
        github = GitHubAdapter()
        tickers_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="amex/amex_full_tickers.json"
        )

        return {
            "status": "success",
            "message": "Ticker list retrieved successfully",
            "data": tickers_data
        }

    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers", response_model=Dict[str, Any])
async def get_all_ticker_lists():
    """
    Retrieve combined list of valid ticker symbols from NASDAQ, NYSE, and AMEX.

    Fetches JSON files from GitHub repository and merges them.
    """
    try:
        github = GitHubAdapter()

        nasdaq_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="nasdaq/nasdaq_full_tickers.json"
        )

        nyse_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="nyse/nyse_full_tickers.json"
        )

        amex_data = github.get_json_file(
            owner="rreichel3",
            repo="US-Stock-Symbols",
            file_path="amex/amex_full_tickers.json"
        )

        combined_data = {
            "nasdaq": nasdaq_data,
            "nyse": nyse_data,
            "amex": amex_data
        }

        return {
            "status": "success",
            "message": "Combined ticker lists retrieved successfully",
            "data": combined_data
        }

    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker lists: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": "finnews-api"
    }


if __name__ == "__main__":
    # Note: Run with 'py -m uvicorn main:app --reload' instead of running this file directly
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8725,
        reload=True
    )
