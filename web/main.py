"""
Web API 入口：提供登录、注册、Bello 在线咨询聊天等接口。
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from web.database import init_db
from web.auth_service import AuthService
from utils.config_handler import web_conf
from utils.logger_handler import logger
from utils.user_id_helper import get_user_id_from_token

app = FastAPI(title="Fish Chatbot Web API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    logger.info("Web API 已启动，数据库已初始化")


# --- 请求/响应模型 ---
class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: Optional[str] = None
    last_login_at: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


def _user_to_response(user) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login_at=user.last_login_at.isoformat() if getattr(user, "last_login_at", None) else None,
    )


@app.post("/api/auth/register", response_model=AuthResponse)
def register(data: RegisterRequest):
    """注册：信息保存到数据库。"""
    auth = AuthService()
    try:
        user = auth.register(data.username, data.password, data.email)
        token = auth.login(data.username, data.password)
        return AuthResponse(token=token, user=_user_to_response(user))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login", response_model=AuthResponse)
def login(data: LoginRequest):
    """登录：验证并更新 last_login_at 到数据库，返回 token。"""
    auth = AuthService()
    try:
        token = auth.login(data.username, data.password)
        payload = auth.verify_token(token)
        from web.database import SessionLocal
        from web.models import User
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == payload["user_id"]).first()
            return AuthResponse(token=token, user=_user_to_response(user))
        finally:
            db.close()
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# --- 聊天接口 ---
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """从 Authorization: Bearer <token> 中解析 user_id"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="请先登录")
    token = authorization.replace("Bearer ", "").strip()
    try:
        return get_user_id_from_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    user_id: int = Depends(get_current_user_id),
):
    """
    在线咨询：调用 Bello 智能助手完成聊天会话。
    session_id 使用当前登录用户的 user_id，保证每个用户独立的聊天历史。
    """
    if not data.message or not data.message.strip():
        raise HTTPException(status_code=400, detail="消息不能为空")
    try:
        from agent.bello import ReactAgent
        agent = ReactAgent()
        session_id = f"user_{user_id}"
        result = agent.invoke(data.message.strip(), session_id=session_id)
        messages = result.get("messages", [])
        if not messages:
            raise HTTPException(status_code=500, detail="助手暂无响应")
        last_msg = messages[-1]
        reply = getattr(last_msg, "content", None) or str(last_msg)
        if not reply:
            reply = "抱歉，我暂时无法回复，请稍后再试。"
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"聊天接口异常: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="服务异常，请稍后再试")


if __name__ == "__main__":
    import uvicorn
    host = web_conf.get("api_host", "0.0.0.0")
    port = web_conf.get("api_port", 8000)
    uvicorn.run("web.main:app", host=host, port=port, reload=True)
