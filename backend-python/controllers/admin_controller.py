# backend-python/controllers/admin_controller.py
from datetime import date, datetime

import aiomysql
from fastapi import HTTPException

from config.db import get_pool


def _require_admin(user: dict) -> None:
    if user.get("id") != 999:
        raise HTTPException(status_code=403, detail="Access Denied: Admins Only")


# ---------------------------------------------------------------------------
# GET ADMIN DASHBOARD DATA
# ---------------------------------------------------------------------------
async def get_admin_dashboard_data(current_user: dict):
    _require_admin(current_user)
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, name, email, location, created_at FROM users ORDER BY created_at DESC"
            )
            users = await cur.fetchall()

            await cur.execute(
                "SELECT id, shop_name, email, location, created_at, status FROM shop_owners ORDER BY created_at DESC"
            )
            shops = await cur.fetchall()

            await cur.execute(
                """
                SELECT offers.id, offers.title, offers.discount_details,
                       shop_owners.shop_name, offers.created_at
                FROM offers
                JOIN shop_owners ON offers.shop_id = shop_owners.id
                ORDER BY offers.created_at DESC
                """
            )
            offers = await cur.fetchall()

    return {
        "users": _serialize(users),
        "shops": _serialize(shops),
        "offers": _serialize(offers),
    }


# ---------------------------------------------------------------------------
# DELETE AN ITEM (user / shop / offer)
# ---------------------------------------------------------------------------
async def delete_item(item_type: str, item_id: int, current_user: dict):
    _require_admin(current_user)
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if item_type == "user":
                await cur.execute("DELETE FROM claims WHERE user_id = %s", (item_id,))
                await cur.execute("DELETE FROM users WHERE id = %s", (item_id,))
            elif item_type == "shop":
                await cur.execute("DELETE FROM offers WHERE shop_id = %s", (item_id,))
                await cur.execute("DELETE FROM shop_owners WHERE id = %s", (item_id,))
            elif item_type == "offer":
                await cur.execute("DELETE FROM claims WHERE offer_id = %s", (item_id,))
                await cur.execute("DELETE FROM offers WHERE id = %s", (item_id,))
            else:
                raise HTTPException(status_code=400, detail="Invalid deletion type")

    return {"message": f"{item_type} deleted successfully!"}


# ---------------------------------------------------------------------------
# UPDATE ACCOUNT STATUS (approve / reject)
# ---------------------------------------------------------------------------
async def update_account_status(item_type: str, item_id: int, new_status: str, current_user: dict):
    _require_admin(current_user)
    # Use explicit conditional instead of f-string to prevent SQL injection
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if item_type == "user":
                await cur.execute("UPDATE users SET status = %s WHERE id = %s", (new_status, item_id))
            else:
                await cur.execute("UPDATE shop_owners SET status = %s WHERE id = %s", (new_status, item_id))
    return {"message": f"{item_type} has been {new_status}!"}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _serialize(rows) -> list:
    result = []
    for row in rows:
        serialized = {}
        for k, v in row.items():
            if isinstance(v, (datetime, date)):
                serialized[k] = v.isoformat()
            else:
                serialized[k] = v
        result.append(serialized)
    return result
