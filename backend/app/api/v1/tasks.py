from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import ValidationError

from app.api.deps import get_current_user, get_task_service
from app.core.exceptions import APIException
from app.models.user import User
from app.schemas.task import (
    PaginationMeta,
    TaskCreate,
    TaskListResponse,
    TaskQueryParams,
    TaskResponse,
    TaskUpdate,
)
from app.services.task_service import TaskService

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])



def get_task_query_params(
    status_value: Annotated[str | None, Query(alias="status")] = None,
    priority_value: Annotated[str | None, Query(alias="priority")] = None,
    search: Annotated[str | None, Query()] = None,
    sort_by: Annotated[str | None, Query(alias="sortBy")] = None,
    sort_order: Annotated[str | None, Query(alias="sortOrder")] = None,
    page: Annotated[str | None, Query()] = None,
    limit: Annotated[str | None, Query()] = None,
) -> TaskQueryParams:
    try:
        return TaskQueryParams(
            status=status_value,
            priority=priority_value,
            search=search,
            sort_by=sort_by or "created_at",
            sort_order=sort_order or "desc",
            page=page or 1,
            limit=limit or 10,
        )
    except ValidationError as exc:
        raise APIException(
            status_code=400,
            code="INVALID_QUERY_PARAMS",
            message="Invalid task query parameters",
            details={"errors": exc.errors()},
        ) from exc


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    task = task_service.create_task(user=current_user, payload=payload)
    return TaskResponse.model_validate(task)


@router.get("", response_model=TaskListResponse)
def list_tasks(
    params: TaskQueryParams = Depends(get_task_query_params),
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
) -> TaskListResponse:
    tasks, total = task_service.list_tasks(user=current_user, params=params)
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        meta=PaginationMeta.build(page=params.page, limit=params.limit, total=total),
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    task = task_service.get_task(user=current_user, task_id=task_id)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    task = task_service.update_task(user=current_user, task_id=task_id, payload=payload)
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
) -> Response:
    task_service.delete_task(user=current_user, task_id=task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
