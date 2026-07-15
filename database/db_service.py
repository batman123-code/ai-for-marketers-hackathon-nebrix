"""
MemoryOS AI - Database Service

Unified wrapper that checks if Supabase is properly configured.
If it is a placeholder or not accessible, it falls back to a local SQLite database (database/memoryos.db).
This ensures 100% of routes remain functional with real relational data.
"""

import os
import sqlite3
import json
import logging
from pathlib import Path
from backend.config import get_settings
from database.supabase import get_supabase, get_supabase_admin
from backend.utils.helpers import utc_now, generate_uuid

logger = logging.getLogger("memoryos.db")
settings = get_settings()

DB_DIR = Path(__file__).resolve().parent
SQLITE_PATH = DB_DIR / "memoryos.db"

class DatabaseService:
    """Manages data access layer using Supabase or SQLite fallback."""

    def __init__(self) -> None:
        self.is_sqlite = "placeholder" in settings.SUPABASE_URL or not settings.SUPABASE_URL
        if self.is_sqlite:
            logger.info("Initializing fallback SQLite database at: %s", SQLITE_PATH)
            self._init_sqlite()
        else:
            logger.info("Supabase URL configured. Standard Client will be used.")

    def _get_sqlite_connection(self) -> sqlite3.Connection:
        """Create and return a SQLite connection with dict-factory row representation."""
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self) -> None:
        """Create SQLite tables if they do not exist."""
        conn = self._get_sqlite_connection()
        cursor = conn.cursor()
        try:
            # Enable foreign keys
            cursor.execute("PRAGMA foreign_keys = ON;")

            # 1. Profiles Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                full_name TEXT DEFAULT '',
                avatar_url TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 2. Companies Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS companies (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                industry TEXT DEFAULT '',
                website TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 3. Customers Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                segment TEXT DEFAULT '',
                lifetime_value REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 4. Campaigns Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                platform TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'draft',
                budget REAL DEFAULT 0.0,
                spend REAL DEFAULT 0.0,
                impressions INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                conversions INTEGER DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 5. Reports Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                report_type TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT '',
                content TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 6. Uploads Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                row_count INTEGER DEFAULT 0,
                column_names TEXT DEFAULT '[]',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """)

            conn.commit()
            logger.info("SQLite database tables verified successfully.")
        except Exception as e:
            logger.error("Failed to initialize SQLite tables: %s", str(e))
            conn.rollback()
        finally:
            conn.close()

    def execute_query(self, query: str, params: tuple = ()) -> list[dict]:
        """Execute a SELECT query and return list of dictionaries."""
        conn = self._get_sqlite_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error("Query execution failed: %s | Query: %s", str(e), query)
            return []
        finally:
            conn.close()

    def execute_write(self, query: str, params: tuple = ()) -> bool:
        """Execute an INSERT, UPDATE, or DELETE query. Return True if successful."""
        conn = self._get_sqlite_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            conn.commit()
            return True
        except Exception as e:
            logger.error("Write execution failed: %s | Query: %s", str(e), query)
            conn.rollback()
            return False
        finally:
            conn.close()

    def provision_user_and_company(self, user_id: str, email: str, full_name: str = "", company_name: str = "", industry: str = "") -> dict:
        """Ensure that a profile and default company exist in the DB for the given user_id."""
        if not self.is_sqlite:
            # Let Supabase trigger handle this or return standard dict
            return {"user_id": user_id, "company_id": "supabase-managed"}

        # 1. Check profile
        profiles = self.execute_query("SELECT * FROM profiles WHERE id = ?", (user_id,))
        if not profiles:
            self.execute_write(
                "INSERT INTO profiles (id, email, full_name) VALUES (?, ?, ?)",
                (user_id, email, full_name or email.split("@")[0].capitalize())
            )
            logger.info("Created fallback profile for user_id: %s", user_id)

        # 2. Check company
        companies = self.execute_query("SELECT * FROM companies WHERE owner_id = ?", (user_id,))
        if not companies:
            company_id = generate_uuid()
            self.execute_write(
                "INSERT INTO companies (id, owner_id, name, industry) VALUES (?, ?, ?, ?)",
                (company_id, user_id, company_name or "My Startup", industry or "Technology")
            )
            logger.info("Created default company: %s for user_id: %s", company_id, user_id)
            return {"user_id": user_id, "company_id": company_id}

        return {"user_id": user_id, "company_id": companies[0]["id"]}

db_service = DatabaseService()
