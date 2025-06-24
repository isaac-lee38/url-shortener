import string
import random
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.db.models import URL

# your Base62 alphabet
_ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase
_BASE = len(_ALPHABET)  # 62

def encode_base62(num: int) -> str:
    """Convert an integer to a Base62 string."""
    if num == 0:
        return _ALPHABET[0]
    s = []
    while num:
        num, rem = divmod(num, _BASE)
        s.append(_ALPHABET[rem])
    return "".join(reversed(s))

async def _normalize_url(raw: str) -> str:
    parsed = urlparse(raw)
    print(parsed, raw)
    if parsed.scheme:
        return raw
    https_url = "https://" + raw
    try:
        # brief HEAD check for TLS support
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.head(https_url, follow_redirects=True)
            if r.is_success:
                return https_url
    except Exception:
        pass

    return "http://" + raw

async def create_short_url(db: AsyncSession, raw_url: str) -> str:
    # 1) normalize
    normalized = await _normalize_url(raw_url)

    # 2) return existing if already shortened
    q = select(URL).where(URL.original_url == normalized)
    res = await db.execute(q)
    existing = res.scalar_one_or_none()
    if existing:
        return existing.short_code

    # 3) insert new row without a short_code
    new = URL(original_url=normalized)
    db.add(new)
    await db.commit()
    await db.refresh(new)

    # 4) encode the assigned PK to Base62, save it back
    code = encode_base62(new.id)
    new.short_code = code
    db.add(new)
    try:
        await db.commit()
    except IntegrityError:
        # Extremely unlikely: another collision on same code?
        # Roll back and regenerate with a random fallback or retry logic
        await db.rollback()
        raise

    return code


async def get_original_url(db: AsyncSession, code: str) -> URL | None:
    q = select(URL).where(URL.short_code == code)
    res = await db.execute(q)
    return res.scalar_one_or_none()