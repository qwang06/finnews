"""
Ticker repository for database operations.
Provides CRUD operations for ticker data.
"""

from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from db_config import db_config


class TickerRepository:
    """Repository for ticker database operations."""

    def __init__(self):
        """Initialize repository with database config."""
        self.db_config = db_config

    def _get_or_create_sector(self, cursor, sector_name: str) -> Optional[int]:
        """Get or create sector, return sector ID."""
        if not sector_name or sector_name.strip() == "":
            return None

        # Check if exists
        cursor.execute("SELECT id FROM sectors WHERE name = %s", (sector_name,))
        result = cursor.fetchone()
        if result:
            return result[0]

        # Create new
        cursor.execute("INSERT INTO sectors (name) VALUES (%s) RETURNING id", (sector_name,))
        return cursor.fetchone()[0]

    def _get_or_create_industry(self, cursor, industry_name: str, sector_id: Optional[int]) -> Optional[int]:
        """Get or create industry, return industry ID."""
        if not industry_name or industry_name.strip() == "":
            return None

        # Check if exists
        cursor.execute("SELECT id FROM industries WHERE name = %s", (industry_name,))
        result = cursor.fetchone()
        if result:
            return result[0]

        # Create new
        cursor.execute(
            "INSERT INTO industries (name, sector_id) VALUES (%s, %s) RETURNING id",
            (industry_name, sector_id)
        )
        return cursor.fetchone()[0]

    def _get_exchange_id(self, cursor, exchange_code: str) -> Optional[int]:
        """Get exchange ID from code."""
        if not exchange_code:
            return None

        cursor.execute("SELECT id FROM exchanges WHERE code = %s", (exchange_code.upper(),))
        result = cursor.fetchone()
        return result[0] if result else None

    def insert_ticker(self, ticker_data: Dict[str, Any], exchange_code: str) -> bool:
        """
        Insert or update ticker data.

        Args:
            ticker_data: Dictionary with ticker information
            exchange_code: Exchange code (NASDAQ, NYSE, AMEX)

        Returns:
            True if successful, False otherwise
        """
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor()

            # Get or create related entities
            sector_id = self._get_or_create_sector(cursor, ticker_data.get("sector", ""))
            industry_id = self._get_or_create_industry(cursor, ticker_data.get("industry", ""), sector_id)
            exchange_id = self._get_exchange_id(cursor, exchange_code)

            # Insert or update ticker
            cursor.execute("""
                INSERT INTO tickers (symbol, name, exchange_id, industry_id, sector_id, country, ipo_year, nasdaq_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol) DO UPDATE SET
                    name = EXCLUDED.name,
                    exchange_id = EXCLUDED.exchange_id,
                    industry_id = EXCLUDED.industry_id,
                    sector_id = EXCLUDED.sector_id,
                    country = EXCLUDED.country,
                    ipo_year = EXCLUDED.ipo_year,
                    nasdaq_url = EXCLUDED.nasdaq_url,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            """, (
                ticker_data.get("symbol"),
                ticker_data.get("name"),
                exchange_id,
                industry_id,
                sector_id,
                ticker_data.get("country"),
                ticker_data.get("ipoyear") or None,
                ticker_data.get("url")
            ))

            ticker_id = cursor.fetchone()[0]

            # Insert price data if available
            if ticker_data.get("lastsale"):
                self._insert_price_data(cursor, ticker_id, ticker_data)

            conn.commit()
            cursor.close()
            return True

        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Error inserting ticker {ticker_data.get('symbol')}: {e}")
            return False

        finally:
            if conn:
                self.db_config.return_connection(conn)

    def _insert_price_data(self, cursor, ticker_id: int, ticker_data: Dict[str, Any]):
        """Insert price data for a ticker."""
        try:
            # Parse price values
            last_sale = self._parse_price(ticker_data.get("lastsale"))
            net_change = self._parse_decimal(ticker_data.get("netchange"))
            pct_change = self._parse_percentage(ticker_data.get("pctchange"))
            volume = self._parse_int(ticker_data.get("volume"))
            market_cap = self._parse_decimal(ticker_data.get("marketCap"))

            cursor.execute("""
                INSERT INTO ticker_prices (ticker_id, last_sale, net_change, pct_change, volume, market_cap)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (ticker_id, last_sale, net_change, pct_change, volume, market_cap))

        except Exception as e:
            print(f"Warning: Could not insert price data: {e}")

    def _parse_price(self, value: Optional[str]) -> Optional[float]:
        """Parse price string (e.g., '$65.86' -> 65.86)."""
        if not value or value == "":
            return None
        try:
            return float(value.replace("$", "").replace(",", ""))
        except (ValueError, AttributeError):
            return None

    def _parse_decimal(self, value: Optional[str]) -> Optional[float]:
        """Parse decimal string."""
        if not value or value == "":
            return None
        try:
            return float(str(value).replace(",", ""))
        except (ValueError, AttributeError):
            return None

    def _parse_percentage(self, value: Optional[str]) -> Optional[float]:
        """Parse percentage string (e.g., '0.259%' -> 0.259)."""
        if not value or value == "":
            return None
        try:
            return float(value.replace("%", ""))
        except (ValueError, AttributeError):
            return None

    def _parse_int(self, value: Optional[str]) -> Optional[int]:
        """Parse integer string."""
        if not value or value == "":
            return None
        try:
            return int(str(value).replace(",", ""))
        except (ValueError, AttributeError):
            return None

    def get_ticker_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get ticker by symbol."""
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT 
                    t.id, t.symbol, t.name, t.country, t.ipo_year, t.nasdaq_url,
                    e.code as exchange_code, e.name as exchange_name,
                    s.name as sector,
                    i.name as industry,
                    t.created_at, t.updated_at
                FROM tickers t
                LEFT JOIN exchanges e ON t.exchange_id = e.id
                LEFT JOIN sectors s ON t.sector_id = s.id
                LEFT JOIN industries i ON t.industry_id = i.id
                WHERE t.symbol = %s
            """, (symbol.upper(),))

            result = cursor.fetchone()
            cursor.close()
            return dict(result) if result else None

        finally:
            if conn:
                self.db_config.return_connection(conn)

    def get_all_tickers(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all tickers with pagination."""
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT 
                    t.symbol, t.name, t.country,
                    e.code as exchange,
                    s.name as sector,
                    i.name as industry
                FROM tickers t
                LEFT JOIN exchanges e ON t.exchange_id = e.id
                LEFT JOIN sectors s ON t.sector_id = s.id
                LEFT JOIN industries i ON t.industry_id = i.id
                ORDER BY t.symbol
                LIMIT %s OFFSET %s
            """, (limit, offset))

            results = cursor.fetchall()
            cursor.close()
            return [dict(row) for row in results]

        finally:
            if conn:
                self.db_config.return_connection(conn)

    def search_tickers(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search tickers by symbol or name."""
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            search_pattern = f"%{query}%"
            cursor.execute("""
                SELECT 
                    t.symbol, t.name, t.country,
                    e.code as exchange,
                    s.name as sector,
                    i.name as industry
                FROM tickers t
                LEFT JOIN exchanges e ON t.exchange_id = e.id
                LEFT JOIN sectors s ON t.sector_id = s.id
                LEFT JOIN industries i ON t.industry_id = i.id
                WHERE t.symbol ILIKE %s OR t.name ILIKE %s
                ORDER BY t.symbol
                LIMIT %s
            """, (search_pattern, search_pattern, limit))

            results = cursor.fetchall()
            cursor.close()
            return [dict(row) for row in results]

        finally:
            if conn:
                self.db_config.return_connection(conn)

    def get_ticker_count(self) -> int:
        """Get total number of tickers."""
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*) FROM tickers")
            count = cursor.fetchone()[0]
            cursor.close()
            return count

        finally:
            if conn:
                self.db_config.return_connection(conn)

    def get_tickers_by_exchange(self, exchange_code: str, limit: int = 10000, offset: int = 0) -> List[Dict[str, Any]]:
        """Get tickers for a specific exchange."""
        conn = None
        try:
            conn = self.db_config.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute("""
                SELECT 
                    t.symbol, t.name, t.country, t.ipo_year,
                    e.code as exchange,
                    s.name as sector,
                    i.name as industry
                FROM tickers t
                LEFT JOIN exchanges e ON t.exchange_id = e.id
                LEFT JOIN sectors s ON t.sector_id = s.id
                LEFT JOIN industries i ON t.industry_id = i.id
                WHERE e.code = %s
                ORDER BY t.symbol
                LIMIT %s OFFSET %s
            """, (exchange_code.upper(), limit, offset))

            results = cursor.fetchall()
            cursor.close()
            return [dict(row) for row in results]

        finally:
            if conn:
                self.db_config.return_connection(conn)
