from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from . import models, schemas
from typing import List, Optional, Literal, Tuple # Add this line
from datetime import datetime, timedelta

# Helper for date range calculation (replicates frontend logic for backend)
def _get_date_range_filter(date_range: str):
    today = datetime.now().date()
    if date_range == 'today':
        start_date = today
    elif date_range == 'yesterday':
        start_date = today - timedelta(days=1)
        today = start_date + timedelta(days=1)
    elif date_range == 'last week':
        start_date = today - timedelta(weeks=1)
    elif date_range == 'early this month':
        start_date = today.replace(day=1)
    elif date_range == 'last month':
        first_day_of_current_month = today.replace(day=1)
        start_date = (first_day_of_current_month - timedelta(days=1)).replace(day=1)
        today = first_day_of_current_month - timedelta(days=1)
    elif date_range == 'early this year':
        start_date = today.replace(month=1, day=1)
    elif date_range == 'long time ago':
        # Assuming "long time ago" means before a certain point, e.g., before the year.
        # This implementation assumes the frontend means "before last month's start".
        first_day_of_current_month = today.replace(day=1)
        start_date = (first_day_of_current_month - timedelta(days=1)).replace(day=1)
        return models.Record.created_at < func.date(start_date) # Filter records BEFORE start_date
    else:
        return None # No filter applied

    # For all ranges except 'long time ago', filter by being ON or AFTER the start_date
    if date_range == 'yesterday':
        # Specific fix for yesterday to include the entire day
        return and_(models.Record.created_at >= func.date(start_date), models.Record.created_at < func.date(today))
    
    return models.Record.created_at >= func.date(start_date)

def get_records(db: Session, params: schemas.PaginationParams) -> Tuple[List[models.Record], int]:
    """
    Retrieves records from the database with filtering, sorting, and pagination.
    
    Returns a tuple: (list of records for the page, total count of records).
    """
    
    # Start the query on the Record model
    query = db.query(models.Record)

    # 1. Filtering / Searching
    # --- FILTERS IMPLEMENTATION ---

# A. Search Filter (Already partially implemented)
    if params.search:
       search_pattern = f"%{params.search}%"
       query = query.filter(models.Record.name.ilike(search_pattern))

    # B. Category Filter (FIX: Changed to case-insensitive ILIKE)
    if params.category_filter:
        # Use ILIKE for case-insensitive matching against the exact filter value
        query = query.filter(models.Record.category.ilike(params.category_filter))

    # C. Status Filter (FIX: Changed to case-insensitive ILIKE)
    if params.status_filter:
        # Use ILIKE for case-insensitive matching against the exact filter value
        query = query.filter(models.Record.status.ilike(params.status_filter))
    # D. Price Range Filter (e.g., '20-40')
    if params.price_range:
        try:
            min_price, max_price = map(float, params.price_range.split('-'))
            query = query.filter(
                and_(models.Record.price >= min_price, models.Record.price <= max_price)
            )
        except ValueError:
            # Optionally log an error for malformed price_range
            pass 

    # E. Date Range Filter
    if params.date_range:
        date_filter_clause = _get_date_range_filter(params.date_range)
        if date_filter_clause is not None:
            query = query.filter(date_filter_clause)
            
    # --- END FILTERS IMPLEMENTATION ---
    
    # Get the total count of filtered records (before pagination)
    total_records = query.count()

    # 2. Sorting (This part is correct and remains the same)
    # Determine the column to sort by using getattr()
    sort_column = getattr(models.Record, params.sort_by)
    
    # Apply ASC or DESC order
    if params.sort_order == "desc":
   
     query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # 3. Pagination (This part is correct and remains the same)
    # Calculate offset
    offset = (params.page - 1) * params.limit
    
    # Apply LIMIT and OFFSET
    records = query.limit(params.limit).offset(offset).all()

    return records, total_records