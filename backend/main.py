from typing import Annotated

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, StringConstraints


app = FastAPI(
    title="Questudy Backend",
    version="0.1.0",
)


class SampleRequest(BaseModel):
    message: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=200, strict=True),
    ] = Field(description="앞뒤 공백을 제외한 1~200자 문자열", examples=["안녕하세요"])


class SampleResponse(BaseModel):
    message: str


@app.get("/", include_in_schema=False)
def index() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/api/health", tags=["상태"], summary="서버 상태 확인")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/sample", tags=["샘플"], summary="문자열 입력 검증", response_model=SampleResponse)
def sample(body: SampleRequest) -> SampleResponse:
    return SampleResponse(message=body.message)
