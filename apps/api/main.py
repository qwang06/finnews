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
from services.ticker_sync_service import ticker_sync_service
from ticker_repository import TickerRepository
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
    Retrieve the list of NASDAQ ticker symbols from database.

    Returns ticker symbols and their metadata stored in the database.
    """
    try:
        repo = TickerRepository()
        tickers_data = repo.get_tickers_by_exchange("NASDAQ")

        return {
            "status": "success",
            "message": "NASDAQ ticker list retrieved successfully",
            "count": len(tickers_data),
            "data": tickers_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers/nyse", response_model=Dict[str, Any])
async def get_nyse_ticker_list():
    """
    Retrieve the list of NYSE ticker symbols from database.

    Returns ticker symbols and their metadata stored in the database.
    """
    try:
        repo = TickerRepository()
        tickers_data = repo.get_tickers_by_exchange("NYSE")

        return {
            "status": "success",
            "message": "NYSE ticker list retrieved successfully",
            "count": len(tickers_data),
            "data": tickers_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers/amex", response_model=Dict[str, Any])
async def get_amex_ticker_list():
    """
    Retrieve the list of AMEX ticker symbols from database.

    Returns ticker symbols and their metadata stored in the database.
    """
    try:
        repo = TickerRepository()
        tickers_data = repo.get_tickers_by_exchange("AMEX")

        return {
            "status": "success",
            "message": "AMEX ticker list retrieved successfully",
            "count": len(tickers_data),
            "data": tickers_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker list: {str(e)}"
        )


@app.get("/api/tickers", response_model=Dict[str, Any])
async def get_all_ticker_lists():
    """
    Retrieve combined list of ticker symbols from NASDAQ, NYSE, and AMEX.

    Fetches ticker data from database and groups by exchange.
    """
    try:
        repo = TickerRepository()

        nasdaq_data = repo.get_tickers_by_exchange("NASDAQ")
        nyse_data = repo.get_tickers_by_exchange("NYSE")
        amex_data = repo.get_tickers_by_exchange("AMEX")

        combined_data = {
            "nasdaq": nasdaq_data,
            "nyse": nyse_data,
            "amex": amex_data
        }

        total_count = len(nasdaq_data) + len(nyse_data) + len(amex_data)

        return {
            "status": "success",
            "message": "Combined ticker lists retrieved successfully",
            "total_count": total_count,
            "counts": {
                "nasdaq": len(nasdaq_data),
                "nyse": len(nyse_data),
                "amex": len(amex_data)
            },
            "data": combined_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch ticker lists: {str(e)}"
        )


@app.post("/api/tickers/sync")
async def sync_tickers(exchange: Optional[str] = None):
    """
    Synchronize ticker data from GitHub repository to database.

    Optionally sync a specific exchange by providing exchange parameter.
    If no exchange specified, syncs all exchanges (NASDAQ, NYSE, AMEX).

    Args:
        exchange: Optional exchange code (NASDAQ, NYSE, AMEX)

    Returns:
        Sync results with statistics
    """
    try:
        if exchange:
            result = ticker_sync_service.sync_specific_exchange(exchange)
        else:
            result = ticker_sync_service.sync_all_exchanges()

        return result

    except RuntimeError as e:
        raise HTTPException(
            status_code=409,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sync failed: {str(e)}"
        )


@app.get("/api/tickers/sync/status")
async def get_sync_status():
    """
    Get current ticker synchronization status.

    Returns:
        Current sync status including progress and statistics
    """
    try:
        status = ticker_sync_service.get_sync_status()
        return {
            "status": "success",
            "data": status
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get sync status: {str(e)}"
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
