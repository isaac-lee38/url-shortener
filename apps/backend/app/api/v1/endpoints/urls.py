from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel # Import BaseModel
from app.db.session import get_db
from app.services.shortener import create_short_url, get_original_url
from app.core.config import settings
from fastapi.responses import RedirectResponse

router = APIRouter()

# 1. Define a Pydantic model for the request body
class URLShortenRequest(BaseModel):
    long_url: str

@router.post("/shorten")
async def shorten_url(request: URLShortenRequest, db: AsyncSession = Depends(get_db)):
    code = await create_short_url(db, request.long_url)
    return {"short_url": f"{settings.BASE_URL}/{code}"}

@router.get("/{code}")
async def redirect(code: str, db: AsyncSession = Depends(get_db)):
    record = await get_original_url(db, code)
    if not record:
        raise HTTPException(404, "URL not found")
    return RedirectResponse(url=record.original_url, status_code=307)