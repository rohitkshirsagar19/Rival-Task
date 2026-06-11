import asyncio
from collections import defaultdict
from dataclasses import dataclass

from app.schemas.realtime import RealtimeTaskEvent


@dataclass
class WebSocketSubscriber:
    queue: asyncio.Queue[RealtimeTaskEvent]
    loop: asyncio.AbstractEventLoop


class WebSocketConnectionManager:
    def __init__(self) -> None:
        self._connections: defaultdict[int, list[WebSocketSubscriber]] = defaultdict(list)

    def connect_user(
        self,
        *,
        user_id: int,
        queue: asyncio.Queue[RealtimeTaskEvent],
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        self._connections[user_id].append(WebSocketSubscriber(queue=queue, loop=loop))

    def disconnect_user(self, *, user_id: int, queue: asyncio.Queue[RealtimeTaskEvent]) -> None:
        subscribers = self._connections.get(user_id, [])
        self._connections[user_id] = [
            subscriber for subscriber in subscribers if subscriber.queue is not queue
        ]
        if not self._connections[user_id]:
            self._connections.pop(user_id, None)

    def broadcast_to_user(self, *, user_id: int, event: RealtimeTaskEvent) -> None:
        subscribers = list(self._connections.get(user_id, []))
        for subscriber in subscribers:
            try:
                subscriber.loop.call_soon_threadsafe(
                    subscriber.queue.put_nowait,
                    event,
                )
            except RuntimeError:
                self.disconnect_user(user_id=user_id, queue=subscriber.queue)


websocket_manager = WebSocketConnectionManager()
