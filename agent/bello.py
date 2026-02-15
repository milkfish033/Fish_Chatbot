from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from model.factory import agent_model
from utils.prompt_loader import load_system_prompts
from agent.tools.agent_tools import (rag_summarize, get_user_id, )
from agent.tools.middleware import *
from agent.tools.memory import FileChatMessageHistory
from utils.config_handler import memory_conf

class ReactAgent:
    def __init__(self):
        self.agent = create_agent(
            model = agent_model,
            system_prompt= load_system_prompts(),
            tools = [
                rag_summarize
            ],
            middleware= []
        )

    def _get_history(self, session_id: str) -> FileChatMessageHistory:
        """根据 session_id 获取对应的聊天历史"""
        return FileChatMessageHistory(
            storage_path=memory_conf["memory_storage_path"],
            session_id=session_id,
            max_rounds=memory_conf.get("max_history_rounds", 10)
        )

    def invoke(self, query: str, session_id: str) -> str:
        """带历史记忆的对话调用"""
        history = self._get_history(session_id)

        # 加载历史消息 + 当前用户消息
        messages = list(history.messages) + [HumanMessage(content=query)]

        # 调用 agent
        result = self.agent.invoke({"messages": messages})

        # 保存本轮对话到历史
        history.add_messages(result["messages"])

        return result


if __name__ == '__main__':
    agent = ReactAgent()
    res = agent.invoke("阳光房系统最大天窗开启尺寸是多少", "user_admin")
    print(res["messages"][-1].content)
