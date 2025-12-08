"""
Database configuration for PostgreSQL connection.
"""

import os
from typing import Optional
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class DatabaseConfig:
    """Manages PostgreSQL database connection configuration and pool."""

    def __init__(self):
        self.db_name = os.getenv("DB_NAME", "finnews")
        self.db_user = os.getenv("DB_USER", "finnews")
        self.db_password = os.getenv("DB_PASSWORD")
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = os.getenv("DB_PORT", "5432")
        self.pool: Optional[SimpleConnectionPool] = None

    def get_connection_string(self) -> str:
        """
        Build PostgreSQL connection string.

        Returns:
            Connection string for psycopg2
        """
        return (
            f"dbname={self.db_name} "
            f"user={self.db_user} "
            f"password={self.db_password} "
            f"host={self.db_host} "
            f"port={self.db_port}"
        )

    def get_connection_params(self) -> dict:
        """
        Get connection parameters as a dictionary.

        Returns:
            Dictionary with connection parameters
        """
        return {
            "dbname": self.db_name,
            "user": self.db_user,
            "password": self.db_password,
            "host": self.db_host,
            "port": self.db_port
        }

    def initialize_pool(self, min_conn: int = 1, max_conn: int = 10):
        """
        Initialize connection pool.

        Args:
            min_conn: Minimum number of connections in pool
            max_conn: Maximum number of connections in pool
        """
        if not self.db_password:
            raise ValueError("DB_PASSWORD environment variable is required")

        self.pool = SimpleConnectionPool(
            min_conn,
            max_conn,
            **self.get_connection_params()
        )

    def get_connection(self):
        """
        Get a connection from the pool.

        Returns:
            Database connection
        """
        if not self.pool:
            raise RuntimeError("Connection pool not initialized. Call initialize_pool() first.")
        return self.pool.getconn()

    def return_connection(self, conn):
        """
        Return a connection to the pool.

        Args:
            conn: Connection to return
        """
        if self.pool:
            self.pool.putconn(conn)

    def close_pool(self):
        """Close all connections in the pool."""
        if self.pool:
            self.pool.closeall()

    def test_connection(self) -> bool:
        """
        Test database connection.

        Returns:
            True if connection successful, False otherwise
        """
        try:
            conn = psycopg2.connect(**self.get_connection_params())
            conn.close()
            return True
        except Exception as e:
            print(f"Database connection failed: {e}")
            return False


# Global database config instance
db_config = DatabaseConfig()
