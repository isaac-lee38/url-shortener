from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SSL configuration
connect_args = {
    "ssl": "require"  # Or use an SSL context for more control
}

engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True,
    connect_args=connect_args
    )
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session