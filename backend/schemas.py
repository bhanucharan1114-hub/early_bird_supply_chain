from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- Pydantic Schemas for validation ---


class AnalysisCreate(BaseModel):
    companyName: str
    productId: Optional[str] = None
    productName: str
    riskScore: float
    riskLevel: str
    components: Dict[str, Any]
    signals: Dict[str, Any]
    summary: str
    incident: Optional[Dict[str, Any]] = None
    followUp: List[str]
    recommendations: List[Any]
    anomalies: List[Any]
    trend: Optional[Dict[str, Any]] = None
    createdAt: str


class AnalysisResponse(AnalysisCreate):
    id: int


class CompanyCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""
    products: List[Any]
    suppliers: List[Any]
    routes: List[Any]


class CompanyResponse(CompanyCreate):
    id: int
