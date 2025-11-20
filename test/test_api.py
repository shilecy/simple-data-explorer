from fastapi.testclient import TestClient
# NOTE: You must adjust the following imports if your package name is different
# from 'simple_data_explorer'.
from backend.app.main import app 
from backend.app.database import get_db as original_get_db
from sqlalchemy.orm import Session
import pytest

# Initialize the TestClient for your FastAPI application
client = TestClient(app)

# --- 1. Test 400 Bad Request Error (Validation from RECORDS.PY) ---

def test_list_records_invalid_page():
    """Tests the explicit validation in RECORDS.PY for 'page < 1'."""
    # Use page=0 which is invalid
    response = client.get("/api/records?page=0&limit=10")
    
    assert response.status_code == 422

def test_list_records_invalid_limit():
    """Tests the explicit validation in RECORDS.PY for 'limit < 1'."""
    # Use limit=0 which is invalid
    response = client.get("/api/records?page=1&limit=0")
    
    assert response.status_code == 422

# --- 2. Test 500 Internal Server Error (Exception Handler in RECORDS.PY) ---

class MockFailingSession:
    """
    A mock database session object that raises an exception when the
    router attempts to execute a query (db.query(models.Record)).
    """
    def query(self, *args, **kwargs):
        # This simulated failure forces the 'except Exception' block in RECORDS.PY to run.
        raise Exception("Simulated database/CRUD failure")
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

def mock_failing_get_db():
    """Dependency that yields the failing session mock[cite: 8]."""
    yield MockFailingSession()

def test_list_records_internal_server_error():
    """
    Tests the general 'except Exception' handler  by overriding 
    the database dependency to force a failure inside the endpoint.
    """
    
    # Temporarily override the original get_db dependency
    app.dependency_overrides[original_get_db] = mock_failing_get_db

    try:
        # Make the request to the /api/records endpoint
        response = client.get("/api/records?page=1&limit=10")
        
        # Assert the response matches the 500 handler in RECORDS.PY 
        assert response.status_code == 500
        assert response.json()["detail"] == "Internal server error"
        
    finally:
        # CRITICAL: Always restore the original dependency after the test
        # Clearing is safer than relying on a specific function name
        app.dependency_overrides.clear()