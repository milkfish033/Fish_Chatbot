from abc import ABC, abstractmethod
from typing import Optional
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.chat_models.tongyi import ChatTongyi, BaseChatModel
from langchain_core.embeddings import Embeddings
from utils.config_handler import rag_conf, agent_conf

class BaseModelFactory(ABC):
    @abstractmethod
    def generator(self) -> Optional[Embeddings | BaseChatModel]:
        pass



class ChatModelFactory(BaseModelFactory):
    def generator(self) -> Optional[Embeddings | BaseChatModel]:
        return ChatTongyi(model = rag_conf["chat_model_name"])


class EmbeddingsFactory(BaseModelFactory):
     def generator(self) -> Optional[Embeddings | BaseChatModel]:
        return DashScopeEmbeddings(model = rag_conf["embedding_model_name"])
     
class AgentFactory(BaseModelFactory):
     def generator(self) -> Optional[Embeddings | BaseChatModel]:
        return ChatTongyi(model = agent_conf["model"])
    
class RouterFactory(BaseModelFactory):
     def generator(self) -> Optional[Embeddings | BaseChatModel]:
        return ChatTongyi(model = agent_conf["model"])

chat_model = ChatModelFactory().generator()
embed_model = EmbeddingsFactory().generator()
agent_model = AgentFactory().generator()
router_model = RouterFactory().generator()