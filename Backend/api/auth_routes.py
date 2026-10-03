from pydantic import BaseModel, EmailStr
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Request, Response

from auth import (
    JWT_EXPIRE_HOURS,
    create_access_token,
    create_user,
    decode_access_token,
    get_user_by_email,
    verify_password,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])

# cookie-name und gültigkeitsdauer in sekunden
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = JWT_EXPIRE_HOURS * 60 * 60


# request-modelle für die validierung
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
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
        "email": payload.get("sub"),
        "name": payload.get("name"),
    }


@router.post("/register")
async def register(body: RegisterRequest, response: Response):
    # registriert einen neuen user und loggt ihn direkt per cookie ein
    if len(body.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Das Passwort muss mindestens 6 Zeichen lang sein.",
        )

    if not body.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Der Name darf nicht leer sein.",
        )

    try:
        user = create_user(
            email=body.email,
            name=body.name.strip(),
            password=body.password,
        )
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except Exception as error:
        print(f"registrierung fehlgeschlagen: {error}")
        raise HTTPException(
            status_code=503,
            detail="Datenbank ist gerade nicht erreichbar. Bitte später erneut versuchen.",
        ) from error

    # nach registrierung direkt einloggen
    token = create_access_token(email=user["email"], name=user["name"])
    _set_token_cookie(response, token)

    return {
        "message": "Registrierung erfolgreich.",
        "user": {
            "email": user["email"],
            "name": user["name"],
        },
    }


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    # user anmelden und jwt-cookie setzen
    try:
        user = get_user_by_email(body.email)
    except Exception as error:
        print(f"login fehlgeschlagen (datenbankfehler): {error}")
        raise HTTPException(
            status_code=503,
            detail="Datenbank ist gerade nicht erreichbar. Bitte später erneut versuchen.",
        ) from error

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="E-Mail oder Passwort ist falsch.",
        )

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="E-Mail oder Passwort ist falsch.",
        )

    token = create_access_token(email=user["email"], name=user["name"])
    _set_token_cookie(response, token)

    return {
        "message": "Login erfolgreich.",
        "user": {
            "email": user["email"],
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
