"""
FastAPI backend for FinNews application.
Handles ticker symbol submissions and returns finance news reports.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uvicorn
from dotenv import load_dotenv
import os

from tiingo_adapter import TiingoClient

# Load environment variables from .env file
load_dotenv()


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
    version="1.0.0"
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
