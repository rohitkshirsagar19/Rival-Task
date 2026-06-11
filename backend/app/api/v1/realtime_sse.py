import asyncio
import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.api.deps import get_current_user
from app.models.user import User
from app.realtime.event_queue import sse_event_queue

router = APIRouter()


async def _event_stream(
    *,
    request: Request,
    user: User,
) -> AsyncIterator[str]:
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    sse_event_queue.subscribe(user_id=user.id, queue=queue, loop=loop)

    try:
        while True:
            if await request.is_disconnected():
                break

            try:
                event = await asyncio.wait_for(queue.get(), timeout=25)
                payload = json.dumps(event.model_dump(mode="json"))
                yield f"event: {event.type}\ndata: {payload}\n\n"
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
    finally:
        sse_event_queue.unsubscribe(user_id=user.id, queue=queue)


@router.get("/api/v1/events/tasks")
async def task_updates_sse(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    return StreamingResponse(
        _event_stream(request=request, user=current_user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
