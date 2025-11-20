import sys
import os
from datetime import datetime
from faker import Faker
from sqlalchemy.orm import Session

# Add the parent directory (backend) to sys.path to resolve 'app.' imports
# This is necessary because seed.py is being run as a module from the root folder.
# We ensure the 'app' package is discoverable.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Use absolute imports from the 'app' package
from app.database import init_db, SessionLocal
from app.models import Record

# Initialize Faker
fake = Faker()
NUM_RECORDS = 120 # Fulfills the "at least 100 records" requirement

def seed_database(db: Session):
    """Generates fake records and inserts them into the database."""
    print(f"--- Seeding {NUM_RECORDS} records ---")
    
    categories = ["Electronics", "Clothing", "Home Goods", "Books", "Tools"]
    statuses = ["In Stock", "Out of Stock", "Discontinued", "On Order"]
    
    for i in range(NUM_RECORDS):
        # Generate varied fake data
        name = f"{fake.word().capitalize()} {fake.word().capitalize()} Product {i+1}"
        category = fake.random_element(categories)
        status = fake.random_element(statuses)
        price = round(fake.random_number(digits=4) / 100, 2)
        created_at = fake.date_time_between(start_date="-2y", end_date="now")

        # Create the SQLAlchemy model instance
        db_record = Record(
            name=name,
            category=category,
            status=status,
            price=price,
            created_at=created_at
        )
        db.add(db_record)
        
        if (i + 1) % 20 == 0:
            print(f"  ... committing {i + 1} records.")
            db.commit()

    db.commit()
    print("--- Database seeding complete! ---")

if __name__ == "__main__":
    try:
        # 1. Initialize the database (creates the SQLite file and tables)
        init_db()
        
        # 2. Get a database session
        db = SessionLocal()
        
        # 3. Clear existing data (optional, but good for repeatable runs)
        db.query(Record).delete()
        db.commit()
        
        # 4. Run the seeding function
        seed_database(db)
        db.close()
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        print("Please ensure your 'backend' directory is in the current path when running.")