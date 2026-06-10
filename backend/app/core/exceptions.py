from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas.common import ErrorDetail, ErrorResponse


class APIException(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)


def build_error_response(
    *,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> ErrorResponse:
    return ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            details=details or {},
        )
    )


async def api_exception_handler(_: Request, exc: APIException) -> JSONResponse:
    payload = build_error_response(
        code=exc.code,
        message=exc.message,
        details=exc.details,
    )
    return JSONResponse(status_code=exc.status_code, content=payload.model_dump())


async def validation_exception_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    payload = build_error_response(
        code="VALIDATION_ERROR",
        message="Request validation failed",
        details={"errors": exc.errors()},
    )
    return JSONResponse(status_code=422, content=payload.model_dump())


async def unexpected_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    payload = build_error_response(
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred",
    )
    return JSONResponse(status_code=500, content=payload.model_dump())


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unexpected_exception_handler)
