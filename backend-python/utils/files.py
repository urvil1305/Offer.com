# backend-python/utils/files.py
import os
import re
import time
from typing import Optional

from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_upload(file: Optional[UploadFile]) -> Optional[str]:
    """Save an uploaded file to the uploads directory and return the URL path."""
    if file is None:
        return None

    original = file.filename or "upload"
    # Strip path separators, null bytes, and any character that isn't
    # alphanumeric, a dash, underscore, or a single dot (for the extension).
    basename = os.path.basename(original)
    safe_name = re.sub(r"[^\w.\-]", "-", basename)
    # Collapse consecutive dashes/spaces
    safe_name = re.sub(r"-{2,}", "-", safe_name).strip("-")
    if not safe_name:
        safe_name = "upload"

    filename = f"{int(time.time() * 1000)}-{safe_name}"
    dest = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(dest, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"
