# ...existing code...
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
import math
import logging

# Initialize the logger for this specific module (Fixes previous Pylance error)
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR) 

# Initialize the APIRouter.
router = APIRouter()

# --- Endpoint for Data Retrieval ---
@router.get("/records", response_model=schemas.PaginatedResponse)
def list_records(
    params: schemas.PaginationParams = Depends(),
    db: Session = Depends(get_db)
):
    """
    Return paginated records.
    Validates page and limit, handles backend errors, and avoids divide-by-zero.
    """
    # Validate pagination inputs
    if params.page is None or params.page < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be >= 1")
    if params.limit is None or params.limit < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be >= 1")

    try:
        # 1. Get the paginated records and the total count from the database
        records, total_records = crud.get_records(db, params=params)

        # 2. Calculate total pages (safe from divide-by-zero because limit >= 1)
        total_pages = 0 if total_records == 0 else math.ceil(total_records / params.limit)

        # 3. Construct and return the PaginatedResponse
        return schemas.PaginatedResponse(
            data=records,
            total_records=total_records,
            total_pages=total_pages,
            current_page=params.page,
            limit=params.limit
        )
    except HTTPException:
        # Re-raise HTTP exceptions created above (or elsewhere) without modification
        raise
    except Exception as exc:
        logger.exception("Failed to list records")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) from exc