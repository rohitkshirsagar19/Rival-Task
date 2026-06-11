from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import APIException
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, SignupRequest


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)

    def signup(self, payload: SignupRequest) -> User:
        password_hash = hash_password(payload.password)
        try:
            user = self.user_repository.create_user(
                name=payload.name,
                email=payload.email,
                password_hash=password_hash,
            )
            self.db.commit()
            return user
        except IntegrityError as exc:
            self.db.rollback()
            raise APIException(
                status_code=409,
                code="DUPLICATE_EMAIL",
                message="An account with this email already exists",
            ) from exc

    def authenticate(self, payload: LoginRequest) -> User:
        user = self.user_repository.get_user_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise APIException(
                status_code=401,
                code="INVALID_CREDENTIALS",
                message="Invalid email or password",
            )
        return user

    def get_user_by_email(self, email: str) -> User | None:
        return self.user_repository.get_user_by_email(email)

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.user_repository.get_user_by_id(user_id)
