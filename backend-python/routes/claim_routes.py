# backend-python/routes/claim_routes.py
from fastapi import APIRouter, Depends

from controllers import claim_controller as ctrl
from middleware.auth import verify_token

router = APIRouter()


@router.get("/my-claims")
async def get_user_claims(current_user: dict = Depends(verify_token)):
    return await ctrl.get_user_claims(current_user["id"])


@router.post("/{offer_id}", status_code=201)
async def claim_offer(offer_id: int, current_user: dict = Depends(verify_token)):
    return await ctrl.claim_offer(offer_id, current_user["id"], current_user.get("role", ""))
