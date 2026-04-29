# backend-python/routes/auth_routes.py
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from controllers import auth_controller as ctrl
from middleware.auth import verify_token

router = APIRouter()


# --- User Routes ---
@router.post("/register/user", status_code=201)
async def register_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    location: Optional[str] = Form(None),
):
    return await ctrl.register_user(name, email, password, location)


@router.post("/login/user")
async def login_user(
    email: str = Form(...),
    password: str = Form(...),
):
    return await ctrl.login_user(email, password)


@router.post("/login")
async def unified_login(
    email: str = Form(...),
    password: str = Form(...),
):
    return await ctrl.unified_login(email, password)


# --- Secure profile routes ---
@router.get("/me")
async def get_me(
    role: Optional[str] = None,
    current_user: dict = Depends(verify_token),
):
    return await ctrl.get_profile(current_user["id"], role)


@router.put("/me")
async def update_me(
    name: str = Form(...),
    location: str = Form(...),
    role: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    logo: Optional[UploadFile] = File(None),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.update_profile(current_user["id"], name, location, role, category_id, logo)


# --- Shop Owner Routes ---
@router.post("/register/shop", status_code=201)
async def register_shop_owner(
    shop_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    location: str = Form(...),
    category_id: Optional[int] = Form(None),
    logo: Optional[UploadFile] = File(None),
):
    return await ctrl.register_shop_owner(shop_name, email, password, location, category_id, logo)


@router.post("/login/shop")
async def login_shop_owner(
    email: str = Form(...),
    password: str = Form(...),
):
    return await ctrl.login_shop_owner(email, password)


# --- Admin Route ---
@router.post("/login/admin")
async def login_admin(
    email: str = Form(...),
    password: str = Form(...),
):
    return await ctrl.login_admin(email, password)


# --- Profile Routes ---
@router.get("/profile")
async def get_profile(
    role: Optional[str] = None,
    current_user: dict = Depends(verify_token),
):
    return await ctrl.get_profile(current_user["id"], role)


@router.put("/profile")
async def update_profile(
    name: str = Form(...),
    location: str = Form(...),
    role: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    logo: Optional[UploadFile] = File(None),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.update_profile(current_user["id"], name, location, role, category_id, logo)


@router.put("/password")
async def update_password(
    currentPassword: str = Form(...),
    newPassword: str = Form(...),
    role: Optional[str] = Form(None),
    current_user: dict = Depends(verify_token),
):
    return await ctrl.update_password(current_user["id"], currentPassword, newPassword, role)
