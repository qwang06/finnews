"""
FastAPI backend for FinNews application.
Handles ticker symbol submissions and returns finance news reports.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn


class TickerRequest(BaseModel):
    """Request model for ticker submissions."""
    ticker: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")


class TickerResponse(BaseModel):
    """Response model for ticker analysis."""
    ticker: str
    message: str
    news_summary: Optional[str] = None
    status: str


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
    Analyze a ticker symbol and return news/report.

    This is a simple implementation that will be enhanced later
    with actual news retrieval and LLM-based report generation.
    """
    ticker = request.ticker.upper()

    # Basic validation
    if not ticker.isalnum():
        raise HTTPException(
            status_code=400,
            detail="Ticker symbol must contain only letters and numbers"
        )

    # TODO: Implement actual news retrieval and LLM analysis
    # For now, return a mock response
    return TickerResponse(
        ticker=ticker,
        message=f"Successfully received ticker: {ticker}",
        news_summary=f"News analysis for {ticker} will be displayed here. "
                     f"This will be replaced with actual news data and AI-generated reports.",
        status="success"
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
