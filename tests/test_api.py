from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_message_rejects_past_date():
    payload = {
        "chat_id": "123456",
        "text": "Oi",
        "send_at": (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat(),
    }
    response = client.post("/messages", json=payload)
    assert response.status_code == 400
    assert "futuro" in response.json()["detail"]
