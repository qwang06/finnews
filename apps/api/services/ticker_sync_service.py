"""
Ticker synchronization service.
Handles importing and updating ticker data from GitHub repository.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from adapters.github_adapter import GitHubAdapter
from ticker_repository import TickerRepository


class SyncStatus:
    """Tracks the status of ticker synchronization."""

    def __init__(self):
        self.is_running = False
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.total_processed = 0
        self.total_success = 0
        self.total_errors = 0
        self.current_exchange: Optional[str] = None
        self.error_message: Optional[str] = None

    def start(self):
        """Mark sync as started."""
        self.is_running = True
        self.started_at = datetime.now()
        self.completed_at = None
        self.total_processed = 0
        self.total_success = 0
        self.total_errors = 0
        self.current_exchange = None
        self.error_message = None

    def complete(self):
        """Mark sync as completed."""
        self.is_running = False
        self.completed_at = datetime.now()
        self.current_exchange = None

    def update_progress(self, exchange: str, processed: int, success: int, errors: int):
        """Update progress counters."""
        self.current_exchange = exchange
        self.total_processed += processed
        self.total_success += success
        self.total_errors += errors

    def set_error(self, error: str):
        """Set error message and stop sync."""
        self.is_running = False
        self.error_message = error
        self.completed_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert status to dictionary."""
        return {
            "is_running": self.is_running,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "current_exchange": self.current_exchange,
            "total_processed": self.total_processed,
            "total_success": self.total_success,
            "total_errors": self.total_errors,
            "error_message": self.error_message
        }


class TickerSyncService:
    """Service for synchronizing ticker data from GitHub."""

    REPO_OWNER = "rreichel3"
    REPO_NAME = "US-Stock-Symbols"

    EXCHANGES = {
        "NASDAQ": "nasdaq/nasdaq_full_tickers.json",
        "NYSE": "nyse/nyse_full_tickers.json",
        "AMEX": "amex/amex_full_tickers.json"
    }

    def __init__(self):
        self.github = GitHubAdapter()
        self.repository = TickerRepository()
        self.status = SyncStatus()

    def sync_exchange(self, exchange_code: str, file_path: str) -> Dict[str, int]:
        """
        Sync ticker data for a single exchange.

        Args:
            exchange_code: Exchange code (NASDAQ, NYSE, AMEX)
            file_path: Path to JSON file in GitHub repo

        Returns:
            Dictionary with sync statistics
        """
        try:
            # Fetch data from GitHub
            ticker_data = self.github.get_json_file(
                owner=self.REPO_OWNER,
                repo=self.REPO_NAME,
                file_path=file_path
            )

            if not isinstance(ticker_data, list):
                raise ValueError(f"Expected list, got {type(ticker_data)}")

            total = len(ticker_data)
            success_count = 0
            error_count = 0

            # Import each ticker
            for ticker in ticker_data:
                if self.repository.insert_ticker(ticker, exchange_code):
                    success_count += 1
                else:
                    error_count += 1

            return {
                "total": total,
                "success": success_count,
                "errors": error_count
            }

        except Exception as e:
            raise ValueError(f"Failed to sync {exchange_code}: {str(e)}")

    def sync_all_exchanges(self) -> Dict[str, Any]:
        """
        Sync ticker data from all exchanges.

        Returns:
            Dictionary with sync results and statistics
        """
        if self.status.is_running:
            raise RuntimeError("Sync already in progress")

        self.status.start()
        results = {}

        try:
            for exchange_code, file_path in self.EXCHANGES.items():
                exchange_result = self.sync_exchange(exchange_code, file_path)
                results[exchange_code] = exchange_result

                self.status.update_progress(
                    exchange=exchange_code,
                    processed=exchange_result["total"],
                    success=exchange_result["success"],
                    errors=exchange_result["errors"]
                )

            self.status.complete()

            return {
                "status": "success",
                "message": "Ticker data synchronized successfully",
                "exchanges": results,
                "summary": {
                    "total_processed": self.status.total_processed,
                    "total_success": self.status.total_success,
                    "total_errors": self.status.total_errors
                },
                "started_at": self.status.started_at.isoformat() if self.status.started_at else None,
                "completed_at": self.status.completed_at.isoformat() if self.status.completed_at else None
            }

        except Exception as e:
            error_msg = f"Sync failed: {str(e)}"
            self.status.set_error(error_msg)
            raise RuntimeError(error_msg)

    def sync_specific_exchange(self, exchange_code: str) -> Dict[str, Any]:
        """
        Sync ticker data for a specific exchange.

        Args:
            exchange_code: Exchange code (NASDAQ, NYSE, AMEX)

        Returns:
            Dictionary with sync results
        """
        exchange_code = exchange_code.upper()

        if exchange_code not in self.EXCHANGES:
            raise ValueError(f"Invalid exchange: {exchange_code}. Must be one of: {', '.join(self.EXCHANGES.keys())}")

        if self.status.is_running:
            raise RuntimeError("Sync already in progress")

        self.status.start()

        try:
            file_path = self.EXCHANGES[exchange_code]
            result = self.sync_exchange(exchange_code, file_path)

            self.status.update_progress(
                exchange=exchange_code,
                processed=result["total"],
                success=result["success"],
                errors=result["errors"]
            )
            self.status.complete()

            return {
                "status": "success",
                "message": f"{exchange_code} ticker data synchronized successfully",
                "exchange": exchange_code,
                "total_processed": result["total"],
                "total_success": result["success"],
                "total_errors": result["errors"],
                "started_at": self.status.started_at.isoformat() if self.status.started_at else None,
                "completed_at": self.status.completed_at.isoformat() if self.status.completed_at else None
            }

        except Exception as e:
            error_msg = f"Sync failed: {str(e)}"
            self.status.set_error(error_msg)
            raise RuntimeError(error_msg)

    def get_sync_status(self) -> Dict[str, Any]:
        """
        Get current sync status.

        Returns:
            Dictionary with current sync status
        """
        status_dict = self.status.to_dict()

        # Add ticker count from database
        try:
            ticker_count = self.repository.get_ticker_count()
            status_dict["total_tickers_in_db"] = ticker_count
        except Exception:
            status_dict["total_tickers_in_db"] = None

        return status_dict


# Global singleton instance
ticker_sync_service = TickerSyncService()
