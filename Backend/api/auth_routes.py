from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Request, Response

from auth import (
    JWT_EXPIRE_HOURS,
    create_access_token,
    decode_access_token,
    get_user_by_username,
    verify_password,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])

# cookie-name und gültigkeitsdauer in sekunden
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = JWT_EXPIRE_HOURS * 60 * 60


class LoginRequest(BaseModel):
    username: str
    password: str


def _set_token_cookie(response: Response, token: str):
    # setzt den jwt-token als httponly-cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )


def _get_current_user(request: Request) -> dict:
    # liest den user aus dem jwt-cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Nicht eingeloggt. Bitte zuerst anmelden.",
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token ungültig oder abgelaufen. Bitte erneut anmelden.",
        )

    return {
        "username": payload.get("sub"),
        "name": payload.get("name"),
    }

@router.post("/login")
async def login(body: LoginRequest, response: Response):
    # user suchen und passwort prüfen
    try:
        user = get_user_by_username(body.username)
    except Exception as error:
        print(f"login fehlgeschlagen: {error}")
        raise HTTPException(
            status_code=503,
            detail="Datenbank ist gerade nicht erreichbar.",
        ) from error

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Benutzername oder Passwort ist falsch.",
        )

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Benutzername oder Passwort ist falsch.",
        )

    token = create_access_token(
        username=user["username"],
        name=user["name"],
    )

    _set_token_cookie(response, token)

    return {
        "message": "Login erfolgreich.",
        "user": {
            "username": user["username"],
            "name": user["name"],
        },
    }


@router.post("/logout")
async def logout(response: Response):
    # meldet einen user ab, indem der cookie gelöscht wird
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"message": "Logout erfolgreich."}


@router.get("/me")
async def get_me(request: Request):
    # gibt den aktuell eingeloggten user zurück
    user = _get_current_user(request)
    return {
        "user": user,
    }
