# backend-python/controllers/auth_controller.py
import os
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional

import aiomysql
from fastapi import HTTPException, UploadFile, status
from passlib.context import CryptContext

from config.db import get_pool
from utils.files import save_upload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin credentials loaded from environment variables
_ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@offer.com")
_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def _make_token(payload: dict) -> str:
    """Sign a JWT that expires in 1 day."""
    payload = dict(payload)
    payload["exp"] = datetime.now(tz=timezone.utc) + timedelta(days=1)
    return jwt.encode(payload, os.getenv("JWT_SECRET", ""), algorithm="HS256")


# ---------------------------------------------------------------------------
# USER REGISTRATION
# ---------------------------------------------------------------------------
async def register_user(name: str, email: str, password: str, location: Optional[str]):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="Email is already registered")

            password_hash = pwd_context.hash(password)
            await cur.execute(
                "INSERT INTO users (name, email, password_hash, location) VALUES (%s, %s, %s, %s)",
                (name, email, password_hash, location or None),
            )
    return {"message": "User registered successfully!"}


# ---------------------------------------------------------------------------
# USER LOGIN
# ---------------------------------------------------------------------------
async def login_user(email: str, password: str):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = await cur.fetchone()

    if not user or not pwd_context.verify(password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = _make_token({"id": user["id"], "role": "user"})
    return {
        "message": "Login successful",
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }


# ---------------------------------------------------------------------------
# SHOP OWNER REGISTRATION
# ---------------------------------------------------------------------------
async def register_shop_owner(
    shop_name: str,
    email: str,
    password: str,
    location: str,
    category_id: Optional[int],
    logo: Optional[UploadFile],
):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id FROM shop_owners WHERE email = %s", (email,))
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            hashed = pwd_context.hash(password)
            logo_url = await save_upload(logo) if logo else None

            await cur.execute(
                "INSERT INTO shop_owners (name, shop_name, category_id, email, password_hash, location, logo_url) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (shop_name, shop_name, category_id, email, hashed, location, logo_url),
            )
    return {"message": "Business account created successfully! Please wait for admin approval."}


# ---------------------------------------------------------------------------
# SHOP OWNER LOGIN
# ---------------------------------------------------------------------------
async def login_shop_owner(email: str, password: str):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM shop_owners WHERE email = %s", (email,))
            owner = await cur.fetchone()

    if not owner or not pwd_context.verify(password, owner["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if owner["status"] == "pending":
        raise HTTPException(status_code=403, detail="Your account is waiting for Admin approval.")
    if owner["status"] == "rejected":
        raise HTTPException(status_code=403, detail="Your account registration was rejected.")

    token = _make_token({"id": owner["id"], "role": "shop_owner"})
    return {
        "message": "Login successful",
        "token": token,
        "owner": {
            "id": owner["id"],
            "name": owner["name"],
            "shop_name": owner["shop_name"],
            "email": owner["email"],
            "status": owner["status"],
        },
    }


# ---------------------------------------------------------------------------
# GET PROFILE
# ---------------------------------------------------------------------------
async def get_profile(user_id: int, role: Optional[str]):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if role == "shop_owner":
                query = """
                    SELECT shop_owners.shop_name AS name, shop_owners.email,
                           shop_owners.location,
                           shop_owners.created_at AS joined,
                           shop_owners.logo_url,
                           categories.name AS category_name
                    FROM shop_owners
                    LEFT JOIN categories ON shop_owners.category_id = categories.id
                    WHERE shop_owners.id = %s
                """
            else:
                query = "SELECT name, email, location, created_at AS joined FROM users WHERE id = %s"

            await cur.execute(query, (user_id,))
            row = await cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    if row.get("joined"):
        dt = row["joined"]
        if isinstance(dt, datetime):
            row["joined"] = dt.strftime("%B %Y")
        else:
            row["joined"] = str(dt)

    return row


# ---------------------------------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------------------------------
async def update_profile(
    user_id: int,
    name: str,
    location: str,
    role: Optional[str],
    category_id: Optional[int],
    logo: Optional[UploadFile],
):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if role == "shop_owner":
                if logo:
                    logo_url = await save_upload(logo)
                    await cur.execute(
                        "UPDATE shop_owners SET shop_name = %s, location = %s, category_id = %s, logo_url = %s WHERE id = %s",
                        (name, location, category_id, logo_url, user_id),
                    )
                else:
                    await cur.execute(
                        "UPDATE shop_owners SET shop_name = %s, location = %s, category_id = %s WHERE id = %s",
                        (name, location, category_id, user_id),
                    )
            else:
                await cur.execute(
                    "UPDATE users SET name = %s, location = %s WHERE id = %s",
                    (name, location, user_id),
                )
    return {"message": "Profile updated successfully!"}


# ---------------------------------------------------------------------------
# UPDATE PASSWORD
# ---------------------------------------------------------------------------
async def update_password(user_id: int, current_password: str, new_password: str, role: Optional[str]):
    # Use explicit conditional instead of f-string to prevent SQL injection
    is_shop = role == "shop_owner"
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            if is_shop:
                await cur.execute("SELECT password_hash FROM shop_owners WHERE id = %s", (user_id,))
            else:
                await cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")

            if not pwd_context.verify(current_password, row["password_hash"]):
                raise HTTPException(status_code=400, detail="Incorrect current password!")

            new_hash = pwd_context.hash(new_password)
            if is_shop:
                await cur.execute("UPDATE shop_owners SET password_hash = %s WHERE id = %s", (new_hash, user_id))
            else:
                await cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))

    return {"message": "Password updated securely!"}


# ---------------------------------------------------------------------------
# ADMIN LOGIN
# ---------------------------------------------------------------------------
async def login_admin(email: str, password: str):
    if email == _ADMIN_EMAIL and password == _ADMIN_PASSWORD:
        token = _make_token({"id": 999, "role": "admin"})
        return {"token": token, "message": "Welcome, Super Admin!"}
    raise HTTPException(status_code=401, detail="Invalid Admin Credentials")


# ---------------------------------------------------------------------------
# UNIFIED SMART LOGIN
# ---------------------------------------------------------------------------
async def unified_login(email: str, password: str):
    # 1. Check hardcoded admin
    if email == _ADMIN_EMAIL and password == _ADMIN_PASSWORD:
        token = _make_token({"id": 999, "role": "admin"})
        return {
            "message": "Welcome, Super Admin!",
            "token": token,
            "role": "admin",
            "user": {"id": 999, "name": "Super Admin", "email": email},
        }

    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # 2. Check users table
            await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = await cur.fetchone()
            if user and pwd_context.verify(password, user["password_hash"]):
                token = _make_token({"id": user["id"], "role": "user"})
                return {
                    "message": "Login successful",
                    "token": token,
                    "role": "user",
                    "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
                }

            # 3. Check shop_owners table
            await cur.execute("SELECT * FROM shop_owners WHERE email = %s", (email,))
            owner = await cur.fetchone()
            if owner and pwd_context.verify(password, owner["password_hash"]):
                if owner["status"] == "pending":
                    raise HTTPException(status_code=403, detail="Your account is waiting for Admin approval.")
                if owner["status"] == "rejected":
                    raise HTTPException(status_code=403, detail="Your account registration was rejected.")
                token = _make_token({"id": owner["id"], "role": "shop_owner"})
                return {
                    "message": "Login successful",
                    "token": token,
                    "role": "shop_owner",
                    "user": {
                        "id": owner["id"],
                        "name": owner["name"],
                        "shop_name": owner["shop_name"],
                        "email": owner["email"],
                    },
                }

    raise HTTPException(status_code=400, detail="Invalid email or password")
