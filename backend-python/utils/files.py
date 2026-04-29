# backend-python/utils/files.py
import os
import time
import re
from typing import Optional

from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_upload(file: Optional[UploadFile]) -> Optional[str]:
    """Save an uploaded file to the uploads directory and return the URL path."""
    if file is None:
        return None

    safe_name = re.sub(r"\s+", "-", file.filename or "upload")
    filename = f"{int(time.time() * 1000)}-{safe_name}"
    dest = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(dest, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"
