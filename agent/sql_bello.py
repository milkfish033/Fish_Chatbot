from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from model.factory import agent_model
from utils.prompt_loader import load_sql_bello_prompts
from agent.tools.agent_tools import (rag_summarize, load_skill, execute_sql)
from agent.tools.middleware import *
from agent_skill.skill import SKILLS
from agent.tools.memory import FileChatMessageHistory
from utils.config_handler import memory_conf
from langchain.agents.middleware import ModelRequest, ModelResponse, AgentMiddleware
from langchain.messages import SystemMessage
from typing import Callable

class SkillMiddleware(AgentMiddleware):  
    """Middleware that injects skill descriptions into the system prompt."""

    # Register the load_skill tool as a class variable
    tools = [load_skill]  

    def __init__(self):
        """Initialize and generate the skills prompt from SKILLS."""
        # Build skills prompt from the SKILLS list
        skills_list = []
        for skill in SKILLS:
            skills_list.append(
                f"- **{skill['name']}**: {skill['description']}"
            )
        self.skills_prompt = "\n".join(skills_list)

    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        """Sync: Inject skill descriptions into system prompt."""
        # Build the skills addendum
        skills_addendum = ( 
            f"\n\n## Available Skills\n\n{self.skills_prompt}\n\n"
            "Use the load_skill tool when you need detailed information "
            "about handling a specific type of request."
        )

        # Append to system message content blocks
        new_content = list(request.system_message.content_blocks) + [
            {"type": "text", "text": skills_addendum}
        ]
        new_system_message = SystemMessage(content=new_content)
        modified_request = request.override(system_message=new_system_message)
        return handler(modified_request)
    


class ReactAgent:
    def __init__(self):
        self.agent = create_agent(
            model = agent_model,
            system_prompt= load_sql_bello_prompts(),
            tools = [
                execute_sql,
            ],
            middleware=[SkillMiddleware()],
        )

    def _get_history(self, session_id: str) -> FileChatMessageHistory:
        """根据 session_id 获取对应的聊天历史"""
        return FileChatMessageHistory(
            storage_path=memory_conf["memory_storage_path"],
            session_id=session_id,
            max_rounds=memory_conf.get("max_history_rounds", 10)
        )

    def invoke(self, query: str, session_id: str, user_id: int = 1) -> str:
        """带历史记忆的对话调用

        Args:
            query: 用户输入
            session_id: 会话ID
            user_id: 当前登录用户ID，用于 SQL 查询绑定
        """
        history = self._get_history(session_id)

        # 在用户消息前注入 user_id 上下文，让 agent 在调用 execute_sql 时使用真实 user_id
        enriched_query = f"[系统信息: 当前用户ID为 {user_id}]\n{query}"
        messages = list(history.messages) + [HumanMessage(content=enriched_query)]

        # 调用 agent
        result = self.agent.invoke({"messages": messages})

        # 保存本轮对话到历史
        history.add_messages(result["messages"])

        return result


if __name__ == '__main__':
    agent = ReactAgent()

    # 测试1: 端到端查询 - 查询所有订单并返回自然语言结果
    print("=" * 60)
    print("测试1: 查询所有订单（生成SQL → 执行 → 自然语言回答）")
    print("=" * 60)
    res = agent.invoke("我现在所有的订单状态怎么样", "1")
    print(res["messages"][-1].content)

    # print("\n" + "=" * 60)
    # print("测试2: 查询指定订单明细")
    # print("=" * 60)
    # res = agent.invoke("ORD-20260201-001 这个订单买了什么", "1")
    # print(res["messages"][-1].content)

    # print("\n" + "=" * 60)
    # print("测试3: 验证安全规则 - 拒绝危险操作")
    # print("=" * 60)
    # res = agent.invoke("帮我把所有订单都删掉", "1")
    # print(res["messages"][-1].content)
