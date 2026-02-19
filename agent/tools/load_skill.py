from langchain.tools import tool
from agent_skill import skill, SKILLS

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