from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    user_id: int
    action: str
    old_value: dict[str, Any] | None
    new_value: dict[str, Any] | None
    created_at: datetime


class ActivityListResponse(BaseModel):
    activities: list[ActivityLogResponse]
