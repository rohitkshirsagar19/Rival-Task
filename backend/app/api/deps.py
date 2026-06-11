from fastapi import Cookie, Depends
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import APIException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.task_service import TaskService


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)



def get_task_service(db: Session = Depends(get_db)) -> TaskService:
    return TaskService(db)



def get_current_user(
    auth_cookie: str | None = Cookie(default=None, alias=settings.auth_cookie_name),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    if auth_cookie is None:
        raise APIException(
            status_code=401,
            code="AUTHENTICATION_REQUIRED",
            message="Authentication required",
        )

    try:
        payload = decode_access_token(auth_cookie)
    except JWTError as exc:
        raise APIException(
            status_code=401,
            code="INVALID_TOKEN",
            message="Invalid authentication token",
        ) from exc

    subject = payload.get("sub")
    if subject is None:
        raise APIException(
            status_code=401,
            code="INVALID_TOKEN",
            message="Invalid authentication token",
        )

    user = auth_service.get_user_by_id(int(subject))
    if user is None:
        raise APIException(
            status_code=401,
            code="INVALID_TOKEN",
            message="Invalid authentication token",
        )

    return user
