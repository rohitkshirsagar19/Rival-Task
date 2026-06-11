import asyncio

from fastapi import APIRouter, WebSocket
from jose import JWTError

from app.core.config import settings
from app.core.security import decode_access_token
from app.realtime.connection_manager import websocket_manager

router = APIRouter()


def _extract_cookie(websocket: WebSocket, cookie_name: str) -> str | None:
    cookie_header = websocket.headers.get("cookie", "")
    for part in cookie_header.split(";"):
        key, _, value = part.strip().partition("=")
        if key == cookie_name:
            return value
    return None


@router.websocket("/api/v1/ws/tasks")
async def task_updates_websocket(websocket: WebSocket) -> None:
    token = _extract_cookie(websocket, settings.auth_cookie_name)
    if token is None:
        await websocket.close(code=4401)
        return

    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        await websocket.close(code=4401)
        return

    await websocket.accept()
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    websocket_manager.connect_user(user_id=user_id, queue=queue, loop=loop)

    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event.model_dump(mode="json"))
    except Exception:
        pass
    finally:
        websocket_manager.disconnect_user(user_id=user_id, queue=queue)
