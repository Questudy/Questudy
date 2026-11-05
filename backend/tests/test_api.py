import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client


def test_health_and_docs(client):
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/", follow_redirects=False).headers["location"] == "/docs"
    assert client.get("/docs").status_code == 200
    schema = client.get("/openapi.json").json()
    assert "422" in schema["paths"]["/api/sample"]["post"]["responses"]


@pytest.mark.parametrize("message", ["안녕하세요", "  hello  ", "가" * 200])
def test_sample_returns_validated_message(client, message):
    response = client.post("/api/sample", json={"message": message})
    assert response.status_code == 200
    assert response.json() == {"message": message.strip()}


@pytest.mark.parametrize("body", [
    {},
    {"message": ""},
    {"message": " \t\n "},
    {"message": "가" * 201},
    {"message": 123},
    {"message": None},
])
def test_sample_rejects_invalid_input(client, body):
    response = client.post("/api/sample", json=body)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "message"]


def test_sample_rejects_malformed_json(client):
    response = client.post(
        "/api/sample",
        content="{",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "json_invalid"
