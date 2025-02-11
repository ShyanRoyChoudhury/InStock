import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve database credentials from environment variables
DB_USERNAME = os.getenv("DB_USERNAME")  # Example: "root"
DB_PASSWORD = os.getenv("DB_PASSWORD")  # Example: "*jE$9/}n.DRQ+Y:,"
DB_HOST = os.getenv("DB_HOST")  # Example: "35.200.233.35"
DB_PORT = os.getenv("DB_PORT", "3306")  # Default MySQL port is 3306
DB_NAME = os.getenv("DB_NAME")  # Example: "shopifyDB"

# URL encode the password to handle special characters
encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

# Construct the SQLAlchemy database URL
DB_URL = f"mysql+pymysql://{DB_USERNAME}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine
engine = create_engine(DB_URL, echo=True)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the Base class for ORM models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
