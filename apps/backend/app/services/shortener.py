import string
from urllib.parse import urlparse

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.db.models import URL
from app.core.config import settings

# Base62 alphabet
_ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase
_BASE = len(_ALPHABET)
# Secret key for obfuscating sequential IDs
_SECRET_KEY = int(settings.SECRET_KEY_FOR_SIGNING_SHORTURL, 16)   # keep private


def encode_base62(num: int) -> str:
    """Convert an integer to a Base62 string."""
    if num == 0:
        return _ALPHABET[0]
    chars = []
    while num:
        num, rem = divmod(num, _BASE)
        chars.append(_ALPHABET[rem])
    return "".join(reversed(chars))


def decode_base62(s: str) -> int:
    """Convert a Base62 string back to an integer."""
    num = 0
    for c in s:
        num = num * _BASE + _ALPHABET.index(c)
    return num


def obfuscate_id(seq_id: int) -> int:
    """Mix sequential ID with a secret key to make the short code unguessable."""
    return seq_id ^ _SECRET_KEY


def deobfuscate_id(code_id: int) -> int:
    """Reverse the obfuscation."""
    return code_id ^ _SECRET_KEY


async def normalize_url(raw: str) -> str:
    """Ensure URL has a scheme and is reachable via HTTPS if possible."""
    parsed = urlparse(raw)
    if parsed.scheme:
        return raw

    https_url = "https://" + raw
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.head(https_url, follow_redirects=True)
            if r.is_success:
                return https_url
    except Exception:
        pass

    return "http://" + raw


async def create_short_url(db: AsyncSession, raw_url: str) -> str:
    """Create a short URL code for a given raw URL."""
    normalized = await normalize_url(raw_url)

    # Return existing short code if URL already exists
    existing = await db.scalar(select(URL).where(URL.original_url == normalized))
    if existing:
        return existing.short_code

    # Insert new row
    new_url = URL(original_url=normalized)
    db.add(new_url)
    await db.commit()
    await db.refresh(new_url)

    # Encode obfuscated ID to Base62
    code = encode_base62(obfuscate_id(new_url.id))
    new_url.short_code = code
    db.add(new_url)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise

    return code


async def get_original_url(db: AsyncSession, code: str) -> URL | None:
    """Fetch the original URL from a short code."""
    return await db.scalar(select(URL).where(URL.short_code == code))
