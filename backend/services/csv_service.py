"""
MemoryOS AI - CSV Service

Handles CSV file parsing, validation, data cleaning, and database mapping using Pandas.
Auto-detects column structures to insert records into either campaigns or customers table.
"""

import logging
import pandas as pd
from io import StringIO
import json
from database.db_service import db_service
from backend.utils.helpers import generate_uuid

logger = logging.getLogger("memoryos.csv")

class CSVService:
    """Processes uploaded CSV files and saves them to the database."""

    def parse_csv(self, content: str) -> pd.DataFrame:
        """Parse CSV string content into a DataFrame."""
        return pd.read_csv(StringIO(content))

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and normalize a DataFrame."""
        # Drop fully empty rows
        df = df.dropna(how="all")
        # Strip whitespace from string columns
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str).str.strip()
        return df

    def get_summary(self, df: pd.DataFrame) -> dict:
        """Return a summary of the DataFrame."""
        return {
            "rows": len(df),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        }

    async def process_and_save_csv(self, company_id: str, filename: str, file_path: str, content: str) -> dict:
        """Parse CSV, detect record type, write to DB, and log the upload record."""
        try:
            df = self.parse_csv(content)
            df = self.clean_data(df)
            row_count = len(df)
            columns = [col.lower() for col in df.columns]

            # 1. Detect table type (campaigns vs customers)
            # Campaigns keywords
            campaign_keywords = {"budget", "spend", "platform", "impressions", "clicks", "conversions", "campaign"}
            is_campaign = any(kw in columns for kw in campaign_keywords)

            inserted_type = "campaign" if is_campaign else "customer"
            logger.info("Processing upload. Detected type: %s. Rows: %d", inserted_type, row_count)

            # 2. Insert records
            for _, row in df.iterrows():
                row_dict = {k.lower(): v for k, v in row.to_dict().items()}
                
                if inserted_type == "campaign":
                    # Columns: name, platform, status, budget, spend, impressions, clicks, conversions, start_date, end_date
                    name = str(row_dict.get("name") or row_dict.get("campaign") or f"Campaign {generate_uuid()[:8]}")
                    platform = str(row_dict.get("platform") or "Google Ads")
                    status = str(row_dict.get("status") or "completed")
                    
                    try:
                        budget = float(row_dict.get("budget", 0.0))
                    except:
                        budget = 0.0
                        
                    try:
                        spend = float(row_dict.get("spend", 0.0))
                    except:
                        spend = 0.0
                        
                    try:
                        impressions = int(float(row_dict.get("impressions", 0)))
                    except:
                        impressions = 0
                        
                    try:
                        clicks = int(float(row_dict.get("clicks", 0)))
                    except:
                        clicks = 0
                        
                    try:
                        conversions = int(float(row_dict.get("conversions", 0)))
                    except:
                        conversions = 0
                        
                    start_date = row_dict.get("start_date") or None
                    end_date = row_dict.get("end_date") or None
                    
                    db_service.execute_write(
                        """INSERT INTO campaigns (id, company_id, name, platform, status, budget, spend, 
                                                impressions, clicks, conversions, start_date, end_date) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (generate_uuid(), company_id, name, platform, status, budget, spend, 
                         impressions, clicks, conversions, start_date, end_date)
                    )
                else:
                    # Customers Columns: name, email, phone, segment, lifetime_value
                    name = str(row_dict.get("name") or row_dict.get("full_name") or f"Customer {generate_uuid()[:8]}")
                    email = str(row_dict.get("email") or "")
                    phone = str(row_dict.get("phone") or "")
                    segment = str(row_dict.get("segment") or "default")
                    
                    try:
                        lifetime_value = float(row_dict.get("lifetime_value", row_dict.get("ltv", 0.0)))
                    except:
                        lifetime_value = 0.0
                        
                    db_service.execute_write(
                        """INSERT INTO customers (id, company_id, name, email, phone, segment, lifetime_value) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (generate_uuid(), company_id, name, email, phone, segment, lifetime_value)
                    )

            # 3. Log metadata in uploads table
            upload_id = generate_uuid()
            db_service.execute_write(
                """INSERT INTO uploads (id, company_id, filename, file_path, row_count, column_names, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (upload_id, company_id, filename, file_path, row_count, json.dumps(list(df.columns)), "completed")
            )

            return {
                "success": True,
                "upload_id": upload_id,
                "row_count": row_count,
                "type": inserted_type,
                "columns": list(df.columns)
            }

        except Exception as e:
            logger.error("Error processing CSV: %s", str(e), exc_info=True)
            return {"success": False, "error": str(e)}

csv_service = CSVService()
