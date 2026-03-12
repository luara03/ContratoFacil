from datetime import datetime, timezone
import logging
import os

import requests
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import select

from app.database import SessionLocal
from app.models import ScheduledMessage

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone="UTC")


class TelegramClient:
    def __init__(self, token: str):
        self.token = token
        self.base_url = f"https://api.telegram.org/bot{token}"

    def send_message(self, chat_id: str, text: str) -> None:
        response = requests.post(
            f"{self.base_url}/sendMessage",
            json={"chat_id": chat_id, "text": text},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        if not payload.get("ok"):
            raise RuntimeError(f"Telegram retornou erro: {payload}")


def process_pending_messages() -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN não configurado; envios pausados")
        return

    client = TelegramClient(token)
    now = datetime.now(timezone.utc)

    with SessionLocal() as db:
        stmt = select(ScheduledMessage).where(
            ScheduledMessage.sent.is_(False),
            ScheduledMessage.send_at <= now,
        )
        pending = db.execute(stmt).scalars().all()

        for item in pending:
            try:
                client.send_message(item.chat_id, item.text)
                item.sent = True
                logger.info("Mensagem %s enviada para chat %s", item.id, item.chat_id)
            except Exception as exc:  # noqa: BLE001
                logger.exception("Falha ao enviar mensagem %s: %s", item.id, exc)

        db.commit()


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.add_job(process_pending_messages, "interval", seconds=30, id="telegram-poller")
        scheduler.start()
