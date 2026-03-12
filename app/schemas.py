from datetime import datetime

from pydantic import BaseModel, Field


class ScheduledMessageCreate(BaseModel):
    chat_id: str = Field(..., description="ID do chat ou canal no Telegram")
    text: str = Field(..., min_length=1, max_length=4096)
    send_at: datetime = Field(..., description="Data/hora em UTC para envio")


class ScheduledMessageRead(BaseModel):
    id: int
    chat_id: str
    text: str
    send_at: datetime
    sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
