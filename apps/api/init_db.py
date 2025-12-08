"""
Database initialization script.
Creates all tables and sets up the database schema.
"""

import os
from pathlib import Path
import psycopg2
from db_config import db_config


def init_database():
    """
    Initialize database by executing schema.sql.
    Creates all tables, indexes, and triggers.
    """
    schema_file = Path(__file__).parent / "schema.sql"

    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")

    # Read SQL schema
    with open(schema_file, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    # Connect and execute
    try:
        conn = psycopg2.connect(**db_config.get_connection_params())
        cursor = conn.cursor()

        print("Executing database schema...")
        cursor.execute(schema_sql)
        conn.commit()

        print("✓ Database schema created successfully")

        # Verify tables were created
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print(f"\nCreated tables:")
        for table in tables:
            print(f"  - {table[0]}")

        cursor.close()
        conn.close()

        return True

    except psycopg2.Error as e:
        print(f"✗ Database error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def drop_all_tables():
    """
    Drop all tables (use with caution!).
    Useful for resetting the database during development.
    """
    try:
        conn = psycopg2.connect(**db_config.get_connection_params())
        cursor = conn.cursor()

        print("WARNING: Dropping all tables...")

        # Drop tables in correct order (respecting foreign keys)
        drop_sql = """
            DROP TABLE IF EXISTS ticker_prices CASCADE;
            DROP TABLE IF EXISTS tickers CASCADE;
            DROP TABLE IF EXISTS industries CASCADE;
            DROP TABLE IF EXISTS sectors CASCADE;
            DROP TABLE IF EXISTS exchanges CASCADE;
            DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
        """

        cursor.execute(drop_sql)
        conn.commit()

        print("✓ All tables dropped")

        cursor.close()
        conn.close()

        return True

    except psycopg2.Error as e:
        print(f"✗ Database error: {e}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        # Reset database (drop and recreate)
        print("=" * 50)
        print("RESETTING DATABASE")
        print("=" * 50)
        drop_all_tables()
        print()
        init_database()
    else:
        # Normal initialization
        print("=" * 50)
        print("INITIALIZING DATABASE")
        print("=" * 50)
        init_database()

    print("\nDone!")
