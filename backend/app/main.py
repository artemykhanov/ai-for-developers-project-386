from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers.owner import router as owner_router
from app.routers.public import router as public_router

app = FastAPI(title="CalKing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "statusCode": 400,
            "code": "bad_request",
            "message": exc.errors()[0]["msg"] if exc.errors() else "Некорректный запрос.",
        },
    )


@app.exception_handler(HTTPException)
def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and {"statusCode", "code", "message"} <= exc.detail.keys():
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content={"statusCode": exc.status_code, "code": "bad_request", "message": str(exc.detail)},
    )


app.include_router(public_router)
app.include_router(owner_router)
