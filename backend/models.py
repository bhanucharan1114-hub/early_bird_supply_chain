from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from datetime import datetime
from database import Base


class SavedAnalysis(Base):
    __tablename__ = "saved_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Matches Firebase/Auth user ID
    company_name = Column(String, index=True)
    product_name = Column(String)

    # Core Risk Metrics
    risk_score = Column(Float)
    risk_level = Column(String)

    # Storing complex JSON objects directly in SQLite
    components = Column(JSON)
    signals = Column(JSON)
    recommendations = Column(JSON)
    anomalies = Column(JSON)
    trend = Column(JSON)

    # AI Generated Content
    summary = Column(Text)
    incident = Column(JSON)
    follow_up = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)


class CustomCompany(Base):
    __tablename__ = "custom_companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    name = Column(String, index=True)
    category = Column(String)
    description = Column(String)

    # JSON structure for the complex company configuration
    products = Column(JSON)
    suppliers = Column(JSON)
    routes = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)
