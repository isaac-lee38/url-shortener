from dotenv import load_dotenv
import os

load_dotenv()

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection
from app.core.config import settings

async def test_conn():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)  # echo=True for debug logs

    async with engine.connect() as conn:  # type: AsyncConnection
        print("Connected!")
    
    await engine.dispose()  # clean up connections

asyncio.run(test_conn())
