import bcrypt
import jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from web.database import init_db, SessionLocal
from web.models import User
from utils.config_handler import web_conf
from utils.logger_handler import logger


class AuthService:
    def __init__(self):
        self.secret_key = web_conf["jwt_secret_key"]
        self.algorithm = web_conf["jwt_algorithm"]
        self.expire_minutes = web_conf["access_token_expire_minutes"]

    def register(self, username: str, password: str, email: str = None) -> User:
        db: Session = SessionLocal()
        try:
            existing_user = db.query(User).filter(User.username == username).first()
            if existing_user:
                logger.warning(f"注册失败: 用户名 '{username}' 已存在")
                raise ValueError(f"用户名 '{username}' 已存在")

            if email:
                existing_email = db.query(User).filter(User.email == email).first()
                if existing_email:
                    logger.warning(f"注册失败: 邮箱 '{email}' 已被使用")
                    raise ValueError(f"邮箱 '{email}' 已被使用")

            password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            user = User(
                username=username,
                email=email,
                password_hash=password_hash
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"用户注册成功: {username}")
            return user
        except ValueError:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"注册异常: {e}", exc_info=True)
            raise
        finally:
            db.close()

    def login(self, username: str, password: str) -> str:
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.username == username).first()
            if not user:
                logger.warning(f"登录失败: 用户 '{username}' 不存在")
                raise ValueError(f"用户 '{username}' 不存在")

            if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
                logger.warning(f"登录失败: 用户 '{username}' 密码错误")
                raise ValueError("密码错误")

            user.last_login_at = datetime.now()
            db.commit()
            db.refresh(user)

            payload = {
                "user_id": user.id,
                "username": user.username,
                "exp": datetime.now() + timedelta(minutes=self.expire_minutes)
            }
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"用户登录成功: {username}")
            return token
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"登录异常: {e}", exc_info=True)
            raise
        finally:
            db.close()

    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            logger.info(f"Token 验证成功: user_id={payload['user_id']}")
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token 已过期")
            raise ValueError("Token 已过期")
        except jwt.InvalidTokenError:
            logger.warning("Token 无效")
            raise ValueError("Token 无效")


if __name__ == "__main__":
    init_db()
    auth = AuthService()

    print("=== 测试注册 ===")
    user = auth.register("testuser", "123456", "test@example.com")
    print(f"注册成功: id={user.id}, username={user.username}, email={user.email}")

    print("\n=== 测试登录 ===")
    token = auth.login("testuser", "123456")
    print(f"登录成功, Token: {token}")

    print("\n=== 测试 Token 验证 ===")
    payload = auth.verify_token(token)
    print(f"Token 验证成功: {payload}")

    print("\n=== 测试重复注册 ===")
    try:
        auth.register("testuser", "654321")
    except ValueError as e:
        print(f"预期错误: {e}")

    print("\n=== 测试密码错误 ===")
    try:
        auth.login("testuser", "wrongpassword")
    except ValueError as e:
        print(f"预期错误: {e}")
