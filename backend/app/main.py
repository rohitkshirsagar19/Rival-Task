from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.tasks import router as tasks_router
from app.core.config import settings
from app.core.constants import HEALTH_PATH
from app.core.exceptions import APIException, register_exception_handlers

app = FastAPI(title=settings.app_name)
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)


@app.get(HEALTH_PATH)
def healthcheck() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
    }


@app.get("/errors/custom")
def custom_error() -> None:
    raise APIException(
        status_code=400,
        code="BAD_REQUEST",
        message="Custom error triggered",
    )


@app.get("/errors/validation")
def validation_error(limit: int = Query(ge=1)) -> dict[str, int]:
    return {"limit": limit}


@app.get("/errors/unexpected")
def unexpected_error() -> None:
    raise RuntimeError("sensitive stack details")
