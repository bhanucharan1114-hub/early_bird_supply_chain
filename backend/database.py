from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# We use SQLite for a seamless, serverless database ideal for production MVPs
SQLALCHEMY_DATABASE_URL = "sqlite:///./supplychain.db"

# Setting check_same_thread to False is needed for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
