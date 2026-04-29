# backend-python/routes/offer_routes.py
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from controllers import offer_controller as ctrl
from middleware.auth import verify_token

router = APIRouter()


@router.post("/create", status_code=201)
async def create_offer(
    title: str = Form(...),
    description: str = Form(...),
    discount_details: str = Form(...),
    valid_until: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.create_offer(
        current_user["id"], title, description, discount_details, valid_until, image
    )


@router.get("/all")
async def get_all_offers():
    return await ctrl.get_all_offers()


@router.get("/my-offers")
async def get_shop_offers(current_user: dict = Depends(verify_token)):
    return await ctrl.get_shop_offers(current_user["id"])


@router.get("/featured-shops")
async def get_featured_shops():
    return await ctrl.get_featured_shops()


@router.get("/directory")
async def get_directory_shops():
    return await ctrl.get_directory_shops()


@router.get("/shop/{shop_id}")
async def get_shop_page_data(shop_id: int):
    return await ctrl.get_shop_page_data(shop_id)


@router.delete("/{offer_id}")
async def delete_offer(offer_id: int, current_user: dict = Depends(verify_token)):
    return await ctrl.delete_offer(offer_id, current_user["id"])


@router.put("/{offer_id}")
async def update_offer(
    offer_id: int,
    title: str = Form(...),
    description: str = Form(...),
    discount_details: str = Form(...),
    valid_until: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.update_offer(
        offer_id, current_user["id"], title, description, discount_details, valid_until, image
    )
