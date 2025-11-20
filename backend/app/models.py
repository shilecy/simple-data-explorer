from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

# Base class for declarative class definitions
Base = declarative_base()

class Record(Base):
    """
    Defines the database table structure for a data record.
    """
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)