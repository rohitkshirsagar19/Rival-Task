from datetime import datetime
from typing import Any

from pydantic import BaseModel


class RealtimeTaskEvent(BaseModel):
    type: str
    task_id: int
    user_id: int
    payload: dict[str, Any]
    timestamp: datetime
