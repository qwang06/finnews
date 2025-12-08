"""
Tiingo API Adapter
Handles all interactions with the Tiingo financial data API.
"""

import os
from typing import Dict, Any, Optional, List
import requests
from datetime import datetime


class TiingoClient:
    """Client for interacting with Tiingo API."""

    BASE_URL = "https://api.tiingo.com"

    def __init__(self, api_token: Optional[str] = None):
        """
        Initialize Tiingo client.

        Args:
            api_token: Tiingo API token. If not provided, will read from TIINGO_API_TOKEN env var.
        """
        self.api_token = api_token or os.getenv("TIINGO_API_TOKEN")
        if not self.api_token:
            raise ValueError(
                "Tiingo API token is required. Set TIINGO_API_TOKEN environment variable "
                "or pass it to TiingoClient constructor."
            )

        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {self.api_token}"
        }

    def get_ticker_metadata(self, ticker: str) -> Dict[str, Any]:
        """
        Get metadata for a ticker symbol.

        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')

        Returns:
            Dict containing ticker metadata including name, description, exchange, etc.

        Raises:
            requests.HTTPError: If the API request fails
            ValueError: If ticker is invalid
        """
        ticker = ticker.upper().strip()
        url = f"{self.BASE_URL}/tiingo/daily/{ticker}"

        response = requests.get(url, headers=self.headers, timeout=10)

        if response.status_code == 404:
            raise ValueError(f"Ticker '{ticker}' not found")

        response.raise_for_status()
        return response.json()

    def get_ticker_prices(
        self,
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get historical price data for a ticker.

        Args:
            ticker: Stock ticker symbol
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)

        Returns:
            List of price records with date, open, high, low, close, volume, etc.

        Raises:
            requests.HTTPError: If the API request fails
        """
        ticker = ticker.upper().strip()
        url = f"{self.BASE_URL}/tiingo/daily/{ticker}/prices"

        params = {}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date

        response = requests.get(url, headers=self.headers, params=params, timeout=10)

        if response.status_code == 404:
            raise ValueError(f"Ticker '{ticker}' not found")

        response.raise_for_status()
        return response.json()

    def get_latest_price(self, ticker: str) -> Dict[str, Any]:
        """
        Get the most recent price data for a ticker.

        Args:
            ticker: Stock ticker symbol

        Returns:
            Dict containing the latest price information
        """
        prices = self.get_ticker_prices(ticker)
        if not prices:
            raise ValueError(f"No price data available for ticker '{ticker}'")
        return prices[-1]  # Last item is the most recent
