"""
用户登录身份工具：从 JWT Token 中解析 user_id。
用户每次登录后持有 token，任意需要当前用户 id 的地方可调用本工具获取。
"""
import jwt
from typing import Optional

from utils.config_handler import web_conf
from utils.logger_handler import logger


def get_user_id_from_token(token: str) -> int:
    """
    从登录后获得的 JWT token 中解析并返回 user_id。
    用于在用户已登录（持有有效 token）时获取当前用户 id。

    :param token: 登录接口返回的 JWT token（或请求头 Authorization 中的 token）
    :return: 用户 id (int)
    :raises ValueError: token 无效或已过期
    """
    secret_key = web_conf["jwt_secret_key"]
    algorithm = web_conf["jwt_algorithm"]
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        user_id = payload.get("user_id")
        if user_id is None:
            logger.warning("Token 中缺少 user_id")
            raise ValueError("Token 无效：缺少 user_id")
        return int(user_id)
    except jwt.ExpiredSignatureError:
        logger.warning("Token 已过期")
        raise ValueError("Token 已过期")
    except jwt.InvalidTokenError:
        logger.warning("Token 无效")
        raise ValueError("Token 无效")


def get_user_id_from_token_or_none(token: Optional[str]) -> Optional[int]:
    """
    从 token 解析 user_id；若未传 token 或解析失败则返回 None，不抛异常。
    适用于“可选登录”场景（如未登录时仍可访问部分接口）。

    :param token: JWT token，可为 None 或空字符串
    :return: user_id 或 None
    """
    if not token or not token.strip():
        return None
    try:
        return get_user_id_from_token(token.strip())
    except ValueError:
        return None
