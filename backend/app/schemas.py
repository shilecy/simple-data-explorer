from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime

# --- Pydantic Schema for a single Record (Response Model) ---
class RecordBase(BaseModel):
    name: str
    category: str
    status: str
    price: float
    created_at: datetime

    class Config:
        # Enable ORM mode to automatically convert SQLAlchemy models to Pydantic objects
        from_attributes = True

class Record(RecordBase):
    id: int

class PaginationParams(BaseModel):
    # Field definitions with default values for query parameters
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)
    # FIX: Added 'status' to the sort_by literal to support sorting on this column
    sort_by: Literal["id", "name", "category", "status", "price", "created_at"] = 'created_at' # Add default value
    sort_order: Literal["asc", "desc"] = 'desc' # Add default value

    # --- NEW FILTER FIELDS ADDED FOR BACKEND ---
    search: Optional[str] = Field(None, description="Search term for product name.")
    category_filter: Optional[str] = Field(None, description="Filter by product category.")
    status_filter: Optional[str] = Field(None, description="Filter by product status.")
    price_range: Optional[str] = Field(None, description="Filter by price range (e.g., '20-40').")
    date_range: Optional[str] = Field(None, description="Filter by date range (e.g., 'last week').")
    # -------------------------------------------

# --- Pydantic Schema for the API Response (Output) ---
class PaginatedResponse(BaseModel):
    data: List[Record]
    total_records: int
    total_pages: int
    current_page: int
    limit: int