from langchain_chroma import Chroma
from utils.config_handler import chroma_conf
from model.factory import embed_model, chat_model
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os 
from utils.path_tool import get_abs_path
from utils.file_handler import text_loader, pdf_loader, listdir_with_allowed_type, get_file_md5_hex
from utils.logger_handler import logger
from langchain_core.documents import Document
import json 


class VectorStoreService:
    def __init__(self):
        self.vector_store = Chroma(
            collection_name = chroma_conf["collection_name"],
            embedding_function= embed_model, 
            persist_directory = chroma_conf["persist_diretory"]
        )
        self.spilter = RecursiveCharacterTextSplitter(
            chunk_size = chroma_conf["chunk_size"],
            chunk_overlap = chroma_conf["chunk_overlap"],
            separators = chroma_conf["separator"],
            length_function = len,
        )


    def get_retriever(self):
        return self.vector_store.as_retriever(search_kwargs = {"k": chroma_conf["k"]})
    


    def load_document(self):
        """
        从数据文件夹内读取文件并作为向量存入向量库
        同时计算文件的md5做去重
        """

        def check_md5_hex(md5_for_check: str):
            if not os.path.exists(get_abs_path(chroma_conf["md5_hex_store"])):
                #创建文件
                open(get_abs_path(chroma_conf["md5_hex_store"]), "w", encoding = 'utf-8').close()
                return False
            
            with open (get_abs_path(chroma_conf["md5_hex_store"]), "r", encoding = 'utf-8') as f:
                for line in f.readlines():
                    line = line.strip()
                    if line == md5_for_check:
                        return True #处理过了
                return False
                
        
        def save_md5_hex(md5_for_check: str):
            with open (get_abs_path(chroma_conf["md5_hex_store"]), "a", encoding = 'utf-8') as f:
                f.write(md5_for_check + "\n")


        def json_loader(read_path: str):
            with open(read_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            documents = []

            for item in data:
                content = item.get("text", "").strip()
                model = item.get("model", "")
                pages = item.get("pages", [])

                if content:
                    documents.append(
                        Document(
                            page_content=content,
                            metadata={
                                "model": model,
                                "pages": pages,
                                "source": "brochure"
                            }
                        )
                    )

            return documents

        def get_file_documents(read_path: str):
            if read_path.endswith("txt"):
                return text_loader(read_path)
            
            if read_path.endswith("pdf"):
                return pdf_loader(read_path)

            if read_path.endswith("json"):
                return json_loader(read_path)
            
            return []
    
        allowed_files_path = listdir_with_allowed_type(
            chroma_conf["data_path"],
            allowed_types= tuple(chroma_conf["allow_knwoledge_file_type"])
            )

        for path in allowed_files_path:

            md5_hex = get_file_md5_hex(path)

            if check_md5_hex(md5_hex):
                logger.info(f"加载知识库{path}已经存在知识库内")
                continue 
                
            try:
                documents: list[Document] = get_file_documents(path)

                if not documents:
                    logger.warning(f"加载知识库{path}内没有有效内容，跳过")
                    continue
                
                spilt_document: list[Document] = self.spilter.split_documents(documents)
                
                if not spilt_document:
                    logger.warning(f"加载知识库{path}，分片后，没有有效内容，跳过")
                    continue

                #将内容存入向量库
                self.vector_store.add_documents(spilt_document)
                save_md5_hex(md5_hex)

                logger.info(f"[加载知识库]{[path]}成功")
            
            except Exception as e:
                #exc_info为True会记录详细的报错堆栈
                logger.error(f"加载知识库{path}失败，失败信息: {str(e)}", exc_info= True)

            
if __name__ == '__main__':
    # print("正在初始化VectorStoreService...")
    vs = VectorStoreService()
    # print("初始化完成，开始加载文档...")
    # vs.load_document()
    # print("加载完成")
    # print("+"*20)
    print(vs.vector_store._collection.count())
    # retriever = vs.get_retriever()

    # res = retriever.invoke("贝克洛")

    # for r in res:
    #     print(r.page_content)
    #     print("=*30")