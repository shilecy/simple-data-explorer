from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# Use relative import for packaged code
from .models import Base 

# Use a SQLite file for simplicity
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# Setting up the engine (connect_args needed for SQLite threading)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create the session local class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency function to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()