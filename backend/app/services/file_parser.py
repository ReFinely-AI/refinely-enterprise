"""
File parsing service for CSV and Excel files.
"""

import pandas as pd
from fastapi import UploadFile
from typing import List, Dict, Any
from datetime import datetime
import io


async def parse_bank_file(
    file: UploadFile,
    date_column: str,
    amount_column: str,
    description_column: str = None
) -> List[Dict[str, Any]]:
    """
    Parse a bank statement file (CSV or Excel).
    
    Returns:
        List of transaction dictionaries with keys: date, amount, description
    """
    
    # Read file content
    content = await file.read()
    
    # Determine file type and parse
    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(content))
    elif file.filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError("Unsupported file format. Use CSV or Excel.")
    
    # Validate required columns exist
    if date_column not in df.columns:
        raise ValueError(f"Date column '{date_column}' not found in file")
    if amount_column not in df.columns:
        raise ValueError(f"Amount column '{amount_column}' not found in file")
    
    transactions = []
    
    for _, row in df.iterrows():
        # Parse date
        date_value = row[date_column]
        if pd.isna(date_value):
            continue
        
        if isinstance(date_value, str):
            # Try common date formats
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]:
                try:
                    date_value = datetime.strptime(date_value, fmt).date()
                    break
                except ValueError:
                    continue
        elif hasattr(date_value, 'date'):
            date_value = date_value.date()
        
        # Parse amount
        amount_value = row[amount_column]
        if pd.isna(amount_value):
            continue
        amount_value = float(amount_value)
        
        # Parse description
        description = None
        if description_column and description_column in df.columns:
            desc_val = row[description_column]
            if not pd.isna(desc_val):
                description = str(desc_val)
        
        transactions.append({
            "date": date_value,
            "amount": amount_value,
            "description": description
        })
    
    return transactions


async def parse_ledger_file(
    file: UploadFile,
    date_column: str,
    debit_column: str,
    credit_column: str,
    description_column: str = None
) -> List[Dict[str, Any]]:
    """
    Parse a ledger file (CSV or Excel).
    
    Returns:
        List of transaction dictionaries with keys: date, debit, credit, description
    """
    
    content = await file.read()
    
    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(content))
    elif file.filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError("Unsupported file format. Use CSV or Excel.")
    
    # Validate columns
    if date_column not in df.columns:
        raise ValueError(f"Date column '{date_column}' not found")
    
    transactions = []
    
    for _, row in df.iterrows():
        date_value = row[date_column]
        if pd.isna(date_value):
            continue
        
        if isinstance(date_value, str):
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]:
                try:
                    date_value = datetime.strptime(date_value, fmt).date()
                    break
                except ValueError:
                    continue
        elif hasattr(date_value, 'date'):
            date_value = date_value.date()
        
        debit = 0
        credit = 0
        
        if debit_column in df.columns:
            debit_val = row[debit_column]
            if not pd.isna(debit_val):
                debit = float(debit_val)
        
        if credit_column in df.columns:
            credit_val = row[credit_column]
            if not pd.isna(credit_val):
                credit = float(credit_val)
        
        description = None
        if description_column and description_column in df.columns:
            desc_val = row[description_column]
            if not pd.isna(desc_val):
                description = str(desc_val)
        
        transactions.append({
            "date": date_value,
            "debit": debit,
            "credit": credit,
            "description": description
        })
    
    return transactions
