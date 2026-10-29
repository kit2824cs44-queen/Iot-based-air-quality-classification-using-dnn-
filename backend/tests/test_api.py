"""
Automated Test Suite for IoT Air Quality Classification System
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify health check endpoint returns 200 and healthy status"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "2.4.0"

def test_single_prediction_valid_payload():
    """Verify valid sensor payload returns 200 with classified category and probabilities"""
    payload = {
        "device_id": "AQI-TEST-001",
        "pm25": 45.0,
        "pm10": 85.0,
        "co": 1.2,
        "no2": 42.0,
        "so2": 18.0,
        "o3": 35.0,
        "temperature": 28.5,
        "humidity": 55.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert "confidence" in data
    assert "class_probabilities" in data
    assert data["predicted_category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"]
    assert data["confidence"] > 0

def test_prediction_invalid_negative_pollutant():
    """Verify negative pollutant concentration is rejected with 422 Unprocessable Entity"""
    payload = {
        "device_id": "AQI-TEST-002",
        "pm25": -10.0,
        "pm10": 50.0,
        "co": 1.0,
        "no2": 20.0,
        "so2": 10.0,
        "o3": 20.0,
        "temperature": 25.0,
        "humidity": 50.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422

def test_prediction_invalid_humidity_bounds():
    """Verify out-of-range humidity (>100%) is rejected with 422 Unprocessable Entity"""
    payload = {
        "device_id": "AQI-TEST-003",
        "pm25": 20.0,
        "pm10": 40.0,
        "co": 0.5,
        "no2": 15.0,
        "so2": 5.0,
        "o3": 25.0,
        "temperature": 25.0,
        "humidity": 150.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422

def test_prediction_missing_required_fields():
    """Verify missing required parameter triggers validation error"""
    payload = {
        "device_id": "AQI-TEST-004",
        "pm25": 30.0
        # Missing other pollutants
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
