# backend-python/controllers/offer_controller.py
from datetime import date, datetime
from typing import Optional

import aiomysql
from fastapi import HTTPException, UploadFile

from config.db import get_pool
from utils.files import save_upload


# ---------------------------------------------------------------------------
# CREATE AN OFFER
# ---------------------------------------------------------------------------
async def create_offer(
    shop_id: int,
    title: str,
    description: str,
    discount_details: str,
    valid_until: str,
    image: Optional[UploadFile],
):
    image_url = await save_upload(image) if image else None
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO offers (shop_id, title, description, discount_details, valid_until, image_url) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (shop_id, title, description, discount_details, valid_until, image_url),
            )
            offer_id = cur.lastrowid
    return {"message": "Offer created successfully!", "offerId": offer_id}


# ---------------------------------------------------------------------------
# GET ALL ACTIVE OFFERS
# ---------------------------------------------------------------------------
async def get_all_offers():
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("DELETE FROM offers WHERE valid_until < NOW()")
            await cur.execute(
                """
                SELECT offers.*, shop_owners.name AS shop_name, shop_owners.location,
                       categories.name AS category_name
                FROM offers
                JOIN shop_owners ON offers.shop_id = shop_owners.id
                LEFT JOIN categories ON shop_owners.category_id = categories.id
                WHERE offers.valid_until >= NOW()
                ORDER BY offers.created_at DESC
                """
            )
            rows = await cur.fetchall()
    return _serialize_rows(rows)


# ---------------------------------------------------------------------------
# DELETE AN OFFER
# ---------------------------------------------------------------------------
async def delete_offer(offer_id: int, shop_id: int):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM offers WHERE id = %s AND shop_id = %s",
                (offer_id, shop_id),
            )
            if cur.rowcount == 0:
                raise HTTPException(
                    status_code=403,
                    detail="Cannot delete: You can only delete your own offers!",
                )
    return {"message": "Offer deleted successfully!"}


# ---------------------------------------------------------------------------
# GET A SPECIFIC SHOP'S OFFERS
# ---------------------------------------------------------------------------
async def get_shop_offers(shop_id: int):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("DELETE FROM offers WHERE valid_until < NOW()")
            await cur.execute(
                "SELECT id AS offer_id, title, description, discount_details, valid_until, image_url "
                "FROM offers WHERE shop_id = %s ORDER BY created_at DESC",
                (shop_id,),
            )
            rows = await cur.fetchall()
    return _serialize_rows(rows)


# ---------------------------------------------------------------------------
# UPDATE AN OFFER
# ---------------------------------------------------------------------------
async def update_offer(
    offer_id: int,
    shop_id: int,
    title: str,
    description: str,
    discount_details: str,
    valid_until: str,
    image: Optional[UploadFile],
):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if image:
                image_url = await save_upload(image)
                await cur.execute(
                    "UPDATE offers SET title = %s, description = %s, discount_details = %s, "
                    "valid_until = %s, image_url = %s WHERE id = %s AND shop_id = %s",
                    (title, description, discount_details, valid_until, image_url, offer_id, shop_id),
                )
            else:
                await cur.execute(
                    "UPDATE offers SET title = %s, description = %s, discount_details = %s, "
                    "valid_until = %s WHERE id = %s AND shop_id = %s",
                    (title, description, discount_details, valid_until, offer_id, shop_id),
                )
            if cur.rowcount == 0:
                raise HTTPException(status_code=403, detail="Unauthorized")
    return {"message": "Offer updated successfully!"}


# ---------------------------------------------------------------------------
# GET FEATURED SHOPS
# ---------------------------------------------------------------------------
async def get_featured_shops():
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, shop_name AS name, logo_url FROM shop_owners WHERE logo_url IS NOT NULL LIMIT 8"
            )
            rows = await cur.fetchall()
    return list(rows)


# ---------------------------------------------------------------------------
# GET SHOP DIRECTORY
# ---------------------------------------------------------------------------
async def get_shop_directory():
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, name, location FROM shop_owners ORDER BY name ASC")
            rows = await cur.fetchall()
    return list(rows)


# ---------------------------------------------------------------------------
# GET SPECIFIC SHOP & ITS OFFERS
# ---------------------------------------------------------------------------
async def get_shop_page_data(shop_id: int):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, name, location, logo_url FROM shop_owners WHERE id = %s",
                (shop_id,),
            )
            shop = await cur.fetchone()
            if not shop:
                raise HTTPException(status_code=404, detail="Shop not found")

            await cur.execute(
                """
                SELECT offers.id AS offer_id, offers.title, offers.description,
                       offers.discount_details, offers.valid_until, offers.image_url,
                       shop_owners.name AS shop_name, shop_owners.location
                FROM offers
                JOIN shop_owners ON offers.shop_id = shop_owners.id
                WHERE offers.shop_id = %s AND offers.valid_until >= NOW()
                ORDER BY offers.created_at DESC
                """,
                (shop_id,),
            )
            offers = await cur.fetchall()

    return {"shop": dict(shop), "offers": _serialize_rows(offers)}


# ---------------------------------------------------------------------------
# GET DIRECTORY SHOPS (shop_name alias)
# ---------------------------------------------------------------------------
async def get_directory_shops():
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT id, shop_name AS name FROM shop_owners ORDER BY shop_name ASC")
            rows = await cur.fetchall()
    return list(rows)


# ---------------------------------------------------------------------------
# Helper: convert datetime objects so they are JSON-serialisable
# ---------------------------------------------------------------------------
def _serialize_rows(rows) -> list:
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
