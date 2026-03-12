from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.database import Base


class ScheduledMessage(Base):
    __tablename__ = "scheduled_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, index=True, nullable=False)
    text = Column(Text, nullable=False)
    send_at = Column(DateTime, index=True, nullable=False)
    sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, nullable=False)
