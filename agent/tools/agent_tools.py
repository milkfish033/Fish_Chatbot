from langchain_core.tools import tool
from rag.rag_service import RagSummarizeService
import random 
from utils.config_handler import agent_conf
from utils.path_tool import get_abs_path
import os 
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