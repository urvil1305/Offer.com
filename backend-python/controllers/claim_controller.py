# backend-python/controllers/claim_controller.py
import random
import string
from datetime import date, datetime

import aiomysql
from fastapi import HTTPException

from config.db import get_pool


# ---------------------------------------------------------------------------
# CLAIM AN OFFER
# ---------------------------------------------------------------------------
async def claim_offer(offer_id: int, user_id: int, role: str):
    if role != "user":
        raise HTTPException(status_code=403, detail="Only registered users can claim offers.")

    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # Check the offer exists and hasn't expired
            await cur.execute(
                "SELECT id FROM offers WHERE id = %s AND valid_until > NOW()",
                (offer_id,),
            )
            if not await cur.fetchone():
                raise HTTPException(status_code=404, detail="Offer not found or has expired.")

            # Check for duplicate claim
            await cur.execute(
                "SELECT id FROM claims WHERE user_id = %s AND offer_id = %s",
                (user_id, offer_id),
            )
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="You have already claimed this offer.")

            # Generate a unique coupon code (e.g. OFF-X7B9A2)
            suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
            coupon_code = f"OFF-{suffix}"

            await cur.execute(
                "INSERT INTO claims (user_id, offer_id, coupon_code) VALUES (%s, %s, %s)",
                (user_id, offer_id, coupon_code),
            )

    return {"message": "Offer claimed successfully!", "coupon_code": coupon_code}


# ---------------------------------------------------------------------------
# GET USER CLAIMS
# ---------------------------------------------------------------------------
async def get_user_claims(user_id: int):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                """
                SELECT
                    claims.coupon_code,
                    claims.claimed_at,
                    offers.title,
                    offers.discount_details,
                    offers.valid_until,
                    shop_owners.shop_name
                FROM claims
                JOIN offers ON claims.offer_id = offers.id
                JOIN shop_owners ON offers.shop_id = shop_owners.id
                WHERE claims.user_id = %s
                ORDER BY claims.claimed_at DESC
                """,
                (user_id,),
            )
            rows = await cur.fetchall()

    # Serialize datetime fields
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
