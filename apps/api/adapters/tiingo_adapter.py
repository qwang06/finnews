"""
Tiingo API Adapter
Handles all interactions with the Tiingo financial data API.
"""

import os
from typing import Dict, Any, Optional, List
from .base_adapter import BaseAdapter


class TiingoClient(BaseAdapter):
    """Client for interacting with Tiingo API."""

    TIINGO_BASE_URL = "https://api.tiingo.com"

    def __init__(self, api_token: Optional[str] = None):
        """
        Initialize Tiingo client.

        Args:
            api_token: Tiingo API token. If not provided, will read from TIINGO_API_TOKEN env var.
        """
        token = api_token or os.getenv("TIINGO_API_TOKEN")
        if not token:
            raise ValueError(
                "Tiingo API token is required. Set TIINGO_API_TOKEN environment variable "
                "or pass it to TiingoClient constructor."
            )

        super().__init__(base_url=self.TIINGO_BASE_URL, api_key=token)

    def _get_default_headers(self) -> Dict[str, str]:
        """Override to use Tiingo-specific headers."""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Token {self.api_key}"
        }

    def get_ticker_metadata(self, ticker: str) -> Dict[str, Any]:
        """
        Get metadata for a ticker symbol.

        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')

        Returns:
            Dict containing ticker metadata including name, description, exchange, etc.

        Raises:
            ValueError: If ticker is invalid or not found
        """
        ticker = ticker.upper().strip()
        endpoint = f"tiingo/daily/{ticker}"

        return self._make_request("GET", endpoint)

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
            ValueError: If ticker is invalid or not found
        """
        ticker = ticker.upper().strip()
        endpoint = f"tiingo/daily/{ticker}/prices"

        params = {}
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date

        response = self._make_request("GET", endpoint, params=params)

        if not isinstance(response, list):
            return [response]
        return response

    def get_latest_price(self, ticker: str) -> Dict[str, Any]:
        """
        Get the most recent price data for a ticker.

        Args:
            ticker: Stock ticker symbol

        Returns:
            Dict containing the latest price information

        Raises:
            ValueError: If no price data available
        """
        prices = self.get_ticker_prices(ticker)
        if not prices:
            raise ValueError(f"No price data available for ticker '{ticker}'")
        return prices[-1]  # Last item is the most recent

    def test_connection(self) -> bool:
        """Test Tiingo API connection and authentication."""
        try:
            # Try to get metadata for a common ticker
            self.get_ticker_metadata("AAPL")
            return True
        except Exception:
            return False
