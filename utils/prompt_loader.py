from utils.config_handler import prompts_conf
from utils.path_tool import get_abs_path
from utils.logger_handler import logger


def load_system_prompts():
    try:
        system_prompt_path = get_abs_path(prompts_conf["main_prompt_path"])
    except KeyError as e:
        logger.error(f"[load_system_prompts]在yaml中没有配置main_prompt_path")
        raise e
    
    try:
        return open(system_prompt_path, "r", encoding = 'utf-8').read()
    except Exception as e:
        logger.error(f"[load_system_prompts]解析系统提示词生成出错, {str(e)}")
        raise e
    

def load_rag_prompts():
    try:
        system_prompt_path = get_abs_path(prompts_conf["rag_sumarize_prompt_path"])
    except KeyError as e:
        logger.error(f"[load_rag_prompts]在yaml中没有配置rag_sumarize_prompt_path")
        raise e
    
    try:
        return open(system_prompt_path, "r", encoding = 'utf-8').read()
    except Exception as e:
        logger.error(f"[load_rag_prompts]解析rag提示词生成出错, {str(e)}")
        raise e
    

def load_report_prompts():
    try:
        system_prompt_path = get_abs_path(prompts_conf["report_prompt_path"])
    except KeyError as e:
        logger.error(f"[load_report_prompts]在yaml中没有配置report_prompt_path")
        raise e
    
    try:
        return open(system_prompt_path, "r", encoding = 'utf-8').read()
    except Exception as e:
        logger.error(f"[load_report_prompts]解析报告生成提示词出错, {str(e)}")
        raise e


def load_intent_prompts():
    try:
        system_prompt_path = get_abs_path(prompts_conf["intent_prompt_path"])
    except KeyError as e:
        logger.error(f"[load_intent_prompts]在yaml中没有配置intent_prompt_path")
        raise e
    
    try:
        return open(system_prompt_path, "r", encoding = 'utf-8').read()
    except Exception as e:
        logger.error(f"[load_intent_prompts]解析报告生成提示词出错, {str(e)}")
        raise e



def load_sql_bello_prompts():
    try:
        system_prompt_path = get_abs_path(prompts_conf["sql_bello_prompt_path"])
    except KeyError as e:
        logger.error(f"[load_sql_bello_prompts]在yaml中没有配置sql_bello_prompt_path")
        raise e

    try:
        return open(system_prompt_path, "r", encoding = 'utf-8').read()
    except Exception as e:
        logger.error(f"[load_sql_bello_prompts]解析SQL Bello提示词出错, {str(e)}")
        raise e


if __name__ == '__main__':
    print(load_system_prompts())
    print("+"*50)
    print(load_rag_prompts())
    print("+"*50)
    print(load_report_prompts())