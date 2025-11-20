from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from .database import engine, get_db
from .routers import records
from fastapi.responses import JSONResponse
import uuid
import logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Simple Data Explorer API",
    description="A FastAPI backend for serving paginated, searchable, and sortable product records.",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Router Inclusion ---
app.include_router(records.router, prefix="/api", tags=["records"])

# --- Root Endpoint (Optional) ---
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Welcome to the Simple Data Explorer API. Check out /docs for the documentation."}