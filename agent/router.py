from langchain_core.messages import SystemMessage, HumanMessage
from model.factory import router_model
from utils.prompt_loader import load_intent_prompts
from utils.logger_handler import logger

model = router_model


"""
router节点，负责判定执行路线。
如果是退货，换货，订单查询， 执行sql_agent路线
如果是其他如产品推荐，产品咨询等，执行bello路线"""
class Router():
    INTENT_LABELS = ["退货", "换货", "订单查询", "其他"]
    SQL_AGENT_INTENTS = {"退货", "换货", "订单查询"}

    def __init__(self):
        self.prompt_text = load_intent_prompts()

    def intent_recognition(self, user_input: str) -> str:
        """
        由模型根据用户输入进行意图识别
        输出标签：退货，换货，订单查询，其他
        """
        messages = [
            SystemMessage(content=self.prompt_text),
            HumanMessage(content=user_input),
        ]
        response = model.invoke(messages)
        intent = response.content.strip()

        if intent not in self.INTENT_LABELS:
            logger.warning(f"[Router]意图识别结果不在预期标签中: '{intent}'，回退为'其他'")
            intent = "其他"

        logger.info(f"[Router]用户输入: '{user_input}' -> 意图: '{intent}'")
        return intent

    def route(self, user_input: str) -> str:
        """
        根据意图识别结果返回路由路线
        返回: 'sql_agent' 或 'bello'
        """
        intent = self.intent_recognition(user_input)
        if intent in self.SQL_AGENT_INTENTS:
            return "sql_agent"
        return "bello"
