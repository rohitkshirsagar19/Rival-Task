from fastapi import APIRouter, Depends

from app.api.deps import get_activity_service, get_current_user, get_task_service
from app.models.user import User
from app.schemas.activity import ActivityListResponse, ActivityLogResponse
from app.services.activity_service import ActivityService
from app.services.task_service import TaskService

router = APIRouter(tags=["activity"])


@router.get("/api/v1/activity", response_model=ActivityListResponse)
def list_activity(
    current_user: User = Depends(get_current_user),
    activity_service: ActivityService = Depends(get_activity_service),
) -> ActivityListResponse:
    activities = activity_service.list_for_user(user=current_user)
    return ActivityListResponse(
        activities=[ActivityLogResponse.model_validate(activity) for activity in activities]
    )


@router.get("/api/v1/tasks/{task_id}/activity", response_model=ActivityListResponse)
def list_task_activity(
    task_id: int,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
    activity_service: ActivityService = Depends(get_activity_service),
) -> ActivityListResponse:
    task_service.get_task(user=current_user, task_id=task_id)
    activities = activity_service.list_for_task(task_id=task_id, user=current_user)
    return ActivityListResponse(
        activities=[ActivityLogResponse.model_validate(activity) for activity in activities]
    )
