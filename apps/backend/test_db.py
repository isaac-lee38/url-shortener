import asyncio
from app.db.session import get_db  # or however you're setting up your session
from app.services.shortener import create_short_url

async def test():
    async for db in get_db():
        code = await create_short_url(db, "https://example.com")
        print(f"Generated code: {code}")

asyncio.run(test())
