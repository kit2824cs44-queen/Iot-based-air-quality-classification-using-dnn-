"""
Pydantic Schemas for IoT Air Quality Classification System
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class SensorReadingCreate(BaseModel):
    device_id: str = Field(..., description="Unique hardware identifier for the sensor node")
    pm25: float = Field(..., ge=0, description="Particulate Matter 2.5 in µg/m³")
    pm10: float = Field(..., ge=0, description="Particulate Matter 10 in µg/m³")
    co: float = Field(..., ge=0, description="Carbon Monoxide in mg/m³")
    no2: float = Field(..., ge=0, description="Nitrogen Dioxide in µg/m³")
    so2: float = Field(..., ge=0, description="Sulfur Dioxide in µg/m³")
    o3: float = Field(..., ge=0, description="Ozone in µg/m³")
    temperature: float = Field(..., ge=-50, le=70, description="Ambient Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Relative Humidity percentage")
    timestamp: Optional[str] = None
    source: Optional[str] = "physical"

class PredictionResponse(BaseModel):
    predicted_category: str
    confidence: float
    class_probabilities: Dict[str, float]
    model_version: str
    calculated_aqi: Optional[int] = None
    aqi_category: Optional[str] = None
    matches_dnn: Optional[bool] = None
    explanation: Optional[str] = None

class BatchPredictionRequest(BaseModel):
    readings: List[SensorReadingCreate]
