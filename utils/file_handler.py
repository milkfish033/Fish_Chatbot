import os
import hashlib
from utils.logger_handler import logger
from langchain_core.documents import Document 
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import json 

def get_file_md5_hex(filepath:str):
    """
    获取文件的md5的十六进制字符串
    """
    if not os.path.exists(filepath):
        logger.error(f"[md5]文件{filepath}不存在")
        return 
    
    if not os.path.isfile(filepath):
        logger.error(f"路径{filepath}不是文件")
        return 
    
    md5_obj = hashlib.md5()

    chunk_size = 4096 #4KB，避免文件过大内存爆炸
    try:
        with open(filepath, "rb") as f:
            while chunk := f.read(chunk_size):
                md5_obj.update(chunk)

            md5_hex = md5_obj.hexdigest()
            return md5_hex
    except Exception as e:
        logger.error(f"计算文件{filepath}md5失败，{str(e)}")
        return None 





def listdir_with_allowed_type(path: str, allowed_types : tuple[str] ):
    """
    返回文件夹内的文件列表
    """
    files = []

    if not os.path.isdir(path):
        logger.error(f"listdir_with_allowed_type{path}不是有效文件夹")
        return 

    for f in os.listdir(path):
        if f.endswith(allowed_types):
            files.append(os.path.join(path, f))

    return tuple(files)



def pdf_loader(file_path: str, password: str = None):
    """
    加载pdf文件
    """
    return PyPDFLoader(file_path, password).load()


def text_loader(file_path: str):
    """
   加载txt文件
    """
    return TextLoader(file_path, encoding = 'utf-8').load()

"""
json转化为list格式"""
def json_loader(read_path: str):
            with open(read_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            documents = []

            for item in data:
                query = item.get("query", "").strip()
                relevant_contents = item.get("relevant_contents", [])
                reference_answer = item.get("reference_answer", "")

                if query:
                    documents.append({
                                "query": query,
                                "relevant_contents": relevant_contents,
                                "reference_answer": reference_answer,
                        })
                    

            return documents