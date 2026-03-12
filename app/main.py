from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import ScheduledMessage
from app.schemas import ScheduledMessageCreate, ScheduledMessageRead
from app.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Telegram Scheduler", version="1.0.0")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup_event() -> None:
    start_scheduler()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/messages", response_model=ScheduledMessageRead)
def create_scheduled_message(
    payload: ScheduledMessageCreate,
    db: Session = Depends(get_db),
) -> ScheduledMessage:
    send_at = payload.send_at
    if send_at.tzinfo is None:
        send_at = send_at.replace(tzinfo=timezone.utc)
    else:
        send_at = send_at.astimezone(timezone.utc)

    if send_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="send_at deve estar no futuro")

    message = ScheduledMessage(
        chat_id=payload.chat_id,
        text=payload.text,
        send_at=send_at,
        sent=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@app.get("/messages", response_model=list[ScheduledMessageRead])
def list_messages(db: Session = Depends(get_db)) -> list[ScheduledMessage]:
    return db.query(ScheduledMessage).order_by(ScheduledMessage.send_at.asc()).all()
