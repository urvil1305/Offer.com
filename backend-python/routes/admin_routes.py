# backend-python/routes/admin_routes.py
from fastapi import APIRouter, Body, Depends

from controllers import admin_controller as ctrl
from middleware.auth import verify_token

router = APIRouter()


@router.get("/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(verify_token)):
    return await ctrl.get_admin_dashboard_data(current_user)


@router.delete("/{item_type}/{item_id}")
async def delete_item(
    item_type: str,
    item_id: int,
    current_user: dict = Depends(verify_token),
):
    return await ctrl.delete_item(item_type, item_id, current_user)


@router.put("/{item_type}/{item_id}/status")
async def update_account_status(
    item_type: str,
    item_id: int,
    status: str = Body(..., embed=True),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.update_account_status(item_type, item_id, status, current_user)
