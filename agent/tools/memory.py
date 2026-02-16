from typing import Sequence
from langchain_core.chat_history import BaseChatMessageHistory
import os, json 
from langchain_core.messages import message_to_dict, messages_from_dict, BaseMessage, HumanMessage
from dotenv import load_dotenv
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from utils.config_handler import memory_conf


#message_to_dic: BaseMessage -> dict
#messages_from_dict: dict -> BaseMessage

class FileChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, storage_path: str, session_id: str, max_rounds: int = 0):
        self.storage_path = storage_path
        self.session_id = session_id
        self.max_rounds = max_rounds  # 最多保留最近N轮对话(1轮=1问1答), 0表示不限制

        #whole file path
        self.file_path = os.path.join(self.storage_path, f"{self.session_id}.json")

        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

    def add_messages(self, messages: Sequence[BaseMessage]) -> None:
        all_messages = list(self.messages)  # Existing messages
        all_messages.extend(messages)  # Add new messages + existing msg

        #store to local file
        #类对象写入文件会得到一堆二进制
        #为了方便，将baseMessage转成dict，再写入文件
        #官方提供了message_to_dict方法，可以直接将BaseMessage转成dict
        # new_messages = []
        # for message in all_messages:
        #     new_messages.append(message_to_dict(message))

        new_messages = [message_to_dict(message) for message in all_messages]
        #将数据写入文件
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(new_messages, f)
        

    @property #将msg当作成员属性来访问
    def messages(self) -> list[BaseMessage]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                messages_data = json.load(f)
            new_messages = messages_from_dict(messages_data)
            # 只返回最近N轮对话 (1轮 = 从HumanMessage到下一个HumanMessage之前的所有消息)
            # 不能按固定条数截断，因为 tool 调用会产生额外消息
            if self.max_rounds > 0:
                round_starts = [i for i, m in enumerate(new_messages) if isinstance(m, HumanMessage)]
                if len(round_starts) > self.max_rounds:
                    cut = round_starts[-self.max_rounds]
                    new_messages = new_messages[cut:]
            return new_messages
        except FileNotFoundError:
            return []
        
    def clear(self) -> None:
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump([], f)

    

load_dotenv()

model = ChatTongyi(model="qwen3-max")
# prompt = PromptTemplate.from_template("你需要根据会话历史回应用户的问题。会话历史如下：\n{history}\n用户的问题是：{question}\n请根据会话历史回答用户的问题。")

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你需要根据会话历史回应用户的问题。"),
        MessagesPlaceholder("history"),
        ("human", "用户的问题是：{question}"),
    ]
)


str_parser = StrOutputParser()

def print_prompt(input: dict):
    print("="*20, input, "="*20)
    return input


#creare a new chain with memory
base_chain = prompt | print_prompt | model | str_parser



#get memory based on session id
def get_history(session_id: str) -> FileChatMessageHistory:
    return FileChatMessageHistory(storage_path=memory_conf["memory_storage_path"], session_id=session_id)



conversation_chain = RunnableWithMessageHistory(
    base_chain,
    get_history, # get InmemoryChatMessageHistory class by session id 
    input_messages_key= "question", #用户输入在模版中的占位符
    history_messages_key= "history" #会话历史在模版中的占位符
)

if __name__ == "__main__":
    #固定格式，创建session id
    session_config = {
        "configurable" : {
            "session_id": "user_admin"
        }
    }
    res = conversation_chain.invoke({"question": "小明有两个猫"}, session_config)
    print("first response: ", res)

    # res = conversation_chain.invoke({"question": "小王有四个狗"}, session_config)
    # print("second response: ", res)

    # res = conversation_chain.invoke({"question": "一共有几个宠物"}, session_config)
    # print("third response: ", res)
