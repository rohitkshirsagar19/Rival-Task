from fastapi import APIRouter, Depends, Response, status

from app.api.deps import get_auth_service, get_current_user
from app.core.security import clear_auth_cookie, create_access_token, set_auth_cookie
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    user = auth_service.signup(payload)
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    user = auth_service.authenticate(payload)
    token = create_access_token(str(user.id))
    set_auth_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
