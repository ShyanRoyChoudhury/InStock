import os
import urllib.parse
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig
from alembic import context
from database import Base  
from models import Product,ProductImage, ProductVariant  
from sqlalchemy.engine.url import URL

print("Base.metadata.tables.keys()", Base.metadata.tables.keys())

# Load environment variables
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = "*jE$9/}n.DRQ+Y:,"
# os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")  # Default MySQL port
DB_NAME = os.getenv("DB_NAME")

def get_url():
    return URL.create(
        drivername="mysql+pymysql",
        username=DB_USERNAME,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
        database=DB_NAME
    )
print(get_url())

# URL encode the password
# encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

# # Construct the SQLAlchemy database URL
# DB_URL = f"mysql+pymysql://{DB_USERNAME}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# escaped_db_url = urllib.parse.quote_plus(DB_URL)

# Configure the Alembic context
config = context.config

# Override the database URL dynamically
# config.set_main_option("sqlalchemy.url", DB_URL)

# # Load logging configuration
# if config.config_file_name is not None:
#     fileConfig(config.config_file_name)

target_metadata = Base.metadata  # Use your SQLAlchemy Base

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=str(get_url()),  
        target_metadata=target_metadata,
        literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = str(get_url())  # ✅ Convert URL object to string
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()