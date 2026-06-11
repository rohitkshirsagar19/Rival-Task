import asyncio
from collections import defaultdict
from dataclasses import dataclass

from app.schemas.realtime import RealtimeTaskEvent


@dataclass
class EventQueueSubscriber:
    queue: asyncio.Queue[RealtimeTaskEvent]
    loop: asyncio.AbstractEventLoop


class SSEEventQueue:
    def __init__(self) -> None:
        self._subscribers: defaultdict[int, list[EventQueueSubscriber]] = defaultdict(list)

    def subscribe(
        self,
        *,
        user_id: int,
        queue: asyncio.Queue[RealtimeTaskEvent],
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        self._subscribers[user_id].append(EventQueueSubscriber(queue=queue, loop=loop))

    def unsubscribe(self, *, user_id: int, queue: asyncio.Queue[RealtimeTaskEvent]) -> None:
        subscribers = self._subscribers.get(user_id, [])
        self._subscribers[user_id] = [
            subscriber for subscriber in subscribers if subscriber.queue is not queue
        ]
        if not self._subscribers[user_id]:
            self._subscribers.pop(user_id, None)

    def publish(self, *, user_id: int, event: RealtimeTaskEvent) -> None:
        subscribers = list(self._subscribers.get(user_id, []))
        for subscriber in subscribers:
            try:
                subscriber.loop.call_soon_threadsafe(
                    subscriber.queue.put_nowait,
                    event,
                )
            except RuntimeError:
                self.unsubscribe(user_id=user_id, queue=subscriber.queue)


sse_event_queue = SSEEventQueue()
