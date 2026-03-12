# ContratoFacil - Telegram Scheduler

Aplicativo simples para **agendar mensagens no Telegram** usando um bot.

## O que ele faz
- Cria agendamentos via API (`POST /messages`)
- Salva mensagens em SQLite
- Um worker em background verifica a cada 30s e envia quando chega o horário

## Pré-requisitos
- Python 3.10+
- Token de bot do Telegram (criado com @BotFather)

## Instalação
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configuração
Defina o token do bot:

```bash
export TELEGRAM_BOT_TOKEN="SEU_TOKEN_AQUI"
```

## Executar
```bash
uvicorn app.main:app --reload
```

API em `http://127.0.0.1:8000`.

## Exemplo de uso
Agendar uma mensagem para 5 minutos no futuro (UTC):

```bash
curl -X POST "http://127.0.0.1:8000/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "text": "Mensagem agendada pelo app 🚀",
    "send_at": "2026-01-01T12:05:00Z"
  }'
```

Listar mensagens:

```bash
curl "http://127.0.0.1:8000/messages"
```

## Observações importantes
- O bot só envia para usuários que já iniciaram conversa com ele, grupos/canais onde ele foi adicionado e tenha permissão.
- `send_at` deve ser no futuro.
- O horário é tratado em UTC.

## Testes
```bash
pytest
```
