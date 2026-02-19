from langchain_core.tools import tool
from rag.rag_service import RagSummarizeService
import random 
from utils.config_handler import agent_conf
from utils.path_tool import get_abs_path
import os
import re
from utils.logger_handler import logger



rag = RagSummarizeService()
@tool (description= "从向量存储中检索参考资料")
def rag_summarize(query: str ) -> str:
    return rag.rag_summarize(query)


@tool(description= "获取指定城市的天气，以消息字符串的形式返回")
def get_weather(city: str) -> str:
    return f"城市{city}天气为晴天，气温为27摄氏度，空气湿度为50%，降雨概率低"


@tool(description = "获取用户所在的城市的名称，以纯字符串的形式返回")
def get_user_location() -> str:
    return random.choice("南京", "上海", "杭州" )



user_ids = ["1", "2", "3", "4"]
@tool (description= "获取用户的ID，以纯字符串的形式返回")
def get_user_id() -> str:
    return random.choice(user_ids)


month_arr = ["一月", "十月", "九月"]
@tool(description="获取当前月份，以纯字符串形式返回")
def get_current_month() -> str:
    return random.choice(month_arr)

external_data = {}

def generate_external_data():
    """{
    user_id:{
        "month": {"特征" : xxx, "效率": xxx}
    },
    user_id:{
        "month": {"特征" : xxx, "效率": xxx}
    },
    user_id:{
        "month": {"特征" : xxx, "效率": xxx}
    },
    }
    """
    if not external_data:
        external_data_path = get_abs_path(agent_conf["external_data_path"])
        if not os.path.exists(external_data):
            raise FileExistsError(f"外部数据文件{ external_data_path}不存在")

        with open(external_data_path, "r", encoding= "utf-8") as f:
            for line in f.readlines():
                line = line.strip().spilt(",")

            user_id = "111" #dummy id for now
            time = "Jan" #dummy time for now 
            if user_id not in external_data:
                external_data[user_id] = {}

            external_data[user_id][time] = {
            }
            



@tool(description= "从外部系统中获取用户的使用记录，以纯字符串形式返回， 如果未检索到，则返回空字符串")
def fetch_external_data(user_id: str, month: str) -> str:
    generate_external_data()

    try:
        return external_data[user_id][month]
    
    except KeyError:
        logger.warning(f"[fetch_external_data]未能检索到用户{user_id}在{month}的使用记录")
        return ""
    

from langchain.tools import tool
from agent_skill.skill import SKILLS
import sqlite3
import json


ORDER_DB_PATH = get_abs_path("data/order.db")

@tool
def execute_sql(sql: str, params_json: str) -> str:
    """执行 SQL 查询并返回结果。

    在通过 load_skill 生成 SQL 后，使用此工具执行查询并获取数据库结果。
    仅支持 SELECT 查询，会自动进行安全校验。

    Args:
        sql: 要执行的 SQL 查询语句（仅限 SELECT）
        params_json: JSON 格式的参数字典，如 '{"user_id": "1", "order_no": "ORD-001"}'
    """
    # 解析参数
    try:
        params = json.loads(params_json)
    except json.JSONDecodeError:
        return json.dumps({"success": False, "error": "参数格式错误，请提供有效的 JSON 字符串"}, ensure_ascii=False)

    # 安全校验：仅允许 SELECT
    sql_stripped = sql.strip().upper()
    if not sql_stripped.startswith("SELECT"):
        return json.dumps({"success": False, "error": "仅允许执行 SELECT 查询"}, ensure_ascii=False)

    # 安全校验：禁止危险关键字（使用单词边界匹配，避免误杀列名如 created_at、updated_at）
    dangerous_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "REPLACE", "ATTACH", "LOAD_EXTENSION"]
    for keyword in dangerous_keywords:
        if re.search(rf'\b{keyword}\b', sql_stripped):
            return json.dumps({"success": False, "error": f"检测到禁止的操作: {keyword}"}, ensure_ascii=False)

    # 安全校验：必须包含 user_id 参数
    if "user_id" not in params:
        return json.dumps({"success": False, "error": "查询必须包含 user_id 参数"}, ensure_ascii=False)

    # 执行查询
    try:
        conn = sqlite3.connect(ORDER_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # sqlite3 使用 :param 命名占位符
        cursor.execute(sql, params)
        rows = cursor.fetchall()

        if not rows:
            result = {"success": True, "data": [], "message": "查询成功，但未找到匹配的记录"}
        else:
            columns = rows[0].keys()
            data = [dict(row) for row in rows]
            result = {"success": True, "data": data, "total": len(data)}

        conn.close()
        return json.dumps(result, ensure_ascii=False, default=str)

    except Exception as e:
        logger.error(f"[execute_sql] 执行查询失败: {e}")
        return json.dumps({"success": False, "error": f"查询执行失败: {str(e)}"}, ensure_ascii=False)

@tool
def load_skill(skill_name: str) -> str:
    """加载指定技能的完整内容到 Agent 上下文中。

    当你需要处理特定类型的用户请求时，使用此工具加载对应技能的详细指令、策略和规范。
    例如当用户询问订单相关问题时，加载 order_query 技能以获取安全的 SQL 查询指引。

    Args:
        skill_name: 技能名称（如 "order_query"）
    """
    # Find and return the requested skill
    for skill in SKILLS:
        if skill["name"] == skill_name:
            return f"Loaded skill: {skill_name}\n\n{skill['content']}"

    # Skill not found
    available = ", ".join(s["name"] for s in SKILLS)
    return f"Skill '{skill_name}' not found. Available skills: {available}"