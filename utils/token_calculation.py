"""
Token 计算工具：读取文件并计算其 Token 数量。
支持 .txt、.pdf、.json 格式，以及纯文本字符串。
优先使用 tiktoken 精确计数，不可用时采用字符级估算（适配 Qwen/Tongyi 模型经验值）。
"""

import os
import re
import json
from utils.logger_handler import logger
from utils.file_handler import pdf_loader, text_loader

# 尝试导入 tiktoken（精确模式，可选依赖）
try:
    import tiktoken  # type: ignore[import-untyped]
    _TIKTOKEN_AVAILABLE = True
except ImportError:
    _TIKTOKEN_AVAILABLE = False


# ---------- 核心计数 ----------

def _estimate_tokens(text: str) -> int:
    """
    基于字符规则的 Token 数量估算（无需外部库）。
    适配 Qwen/Tongyi 模型的分词特点：
      - 中文字符：约 1.5 token / 字
      - 英文单词：约 1.3 token / 词
      - 数字：约 0.5 token / 位
      - 其他符号/空白：约 0.3 token / 字符
    """
    if not text:
        return 0

    chinese = re.findall(r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]', text)
    english_words = re.findall(r'[a-zA-Z]+', text)
    digits = re.findall(r'[0-9]', text)

    # 已被上面规则覆盖的字符数
    covered = (
        len(chinese)
        + sum(len(w) for w in english_words)
        + len(digits)
    )
    other = max(0, len(text) - covered)

    estimated = (
        len(chinese) * 1.5
        + len(english_words) * 1.3
        + len(digits) * 0.5
        + other * 0.3
    )
    return max(1, int(estimated))


def count_tokens(text: str, encoding: str = "cl100k_base") -> int:
    """
    计算任意文本的 Token 数量。
    tiktoken 可用时精确计数，否则使用估算。

    :param text: 待计算文本
    :param encoding: tiktoken 编码名称（仅 tiktoken 模式有效）
    :return: Token 数量
    """
    if not text:
        return 0

    if _TIKTOKEN_AVAILABLE:
        try:
            enc = tiktoken.get_encoding(encoding)
            return len(enc.encode(text))
        except Exception as e:
            logger.warning(f"tiktoken 计数失败，退回估算模式: {e}")

    return _estimate_tokens(text)


# ---------- 文件读取 ----------

def _read_file_as_text(file_path: str) -> str:
    """
    根据扩展名选择合适的加载器，将文件内容转换为纯文本字符串。
    支持 .txt / .pdf / .json，其他类型尝试 UTF-8 读取。
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        docs = text_loader(file_path)
        return "\n".join(
            d.page_content if hasattr(d, "page_content") else str(d)
            for d in docs
        )

    if ext == ".pdf":
        docs = pdf_loader(file_path)
        return "\n".join(
            d.page_content if hasattr(d, "page_content") else str(d)
            for d in docs
        )

    if ext == ".json":
        # 直接读原始文本，避免 json_loader 因格式不匹配而丢失内容
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    # 其他格式：当作纯文本
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


# ---------- 文件级接口 ----------

def count_tokens_from_file(
    file_path: str,
    encoding: str = "cl100k_base",
) -> dict:
    """
    读取单个文件并计算 Token 数量。

    :param file_path: 文件绝对/相对路径
    :param encoding: tiktoken 编码（精确模式有效）
    :return: 包含统计信息的字典，失败时包含 "error" 键
    """
    if not os.path.exists(file_path):
        msg = f"文件不存在: {file_path}"
        logger.error(msg)
        return {"error": msg, "file": os.path.basename(file_path), "path": file_path}

    if not os.path.isfile(file_path):
        msg = f"路径不是文件: {file_path}"
        logger.error(msg)
        return {"error": msg, "file": os.path.basename(file_path), "path": file_path}

    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)

    try:
        text = _read_file_as_text(file_path)
        token_count = count_tokens(text, encoding)
        char_count = len(text)
        mode = "精确（tiktoken）" if _TIKTOKEN_AVAILABLE else "估算"

        result = {
            "file": file_name,
            "path": file_path,
            "format": os.path.splitext(file_name)[1].lower() or "unknown",
            "size_bytes": file_size,
            "char_count": char_count,
            "token_count": token_count,
            "mode": mode,
        }
        logger.info(f"[token] {file_name}: {token_count} tokens ({mode})")
        return result

    except Exception as e:
        logger.error(f"处理文件 {file_path} 时出错: {e}")
        return {
            "error": str(e),
            "file": file_name,
            "path": file_path,
        }


def count_tokens_from_files(
    file_paths: list[str],
    encoding: str = "cl100k_base",
) -> dict:
    """
    批量计算多个文件的 Token 数量，并返回汇总信息。

    :param file_paths: 文件路径列表
    :param encoding: tiktoken 编码（精确模式有效）
    :return: 包含各文件结果及汇总的字典
    """
    results = []
    total_tokens = 0
    total_chars = 0
    error_count = 0

    for path in file_paths:
        result = count_tokens_from_file(path, encoding)
        results.append(result)
        if "token_count" in result:
            total_tokens += result["token_count"]
            total_chars += result["char_count"]
        else:
            error_count += 1

    return {
        "files": results,
        "total_files": len(file_paths),
        "success_count": len(file_paths) - error_count,
        "error_count": error_count,
        "total_chars": total_chars,
        "total_tokens": total_tokens,
        "mode": "精确（tiktoken）" if _TIKTOKEN_AVAILABLE else "估算",
    }


def count_tokens_from_dir(
    dir_path: str,
    allowed_exts: tuple[str, ...] = (".txt", ".pdf", ".json"),
    encoding: str = "cl100k_base",
) -> dict:
    """
    统计文件夹内所有受支持文件的 Token 总量。

    :param dir_path: 文件夹路径
    :param allowed_exts: 允许的文件扩展名元组
    :param encoding: tiktoken 编码（精确模式有效）
    :return: 包含各文件结果及汇总的字典
    """
    if not os.path.isdir(dir_path):
        msg = f"不是有效文件夹: {dir_path}"
        logger.error(msg)
        return {"error": msg, "dir": dir_path}

    file_paths = [
        os.path.join(dir_path, fname)
        for fname in sorted(os.listdir(dir_path))
        if fname.lower().endswith(allowed_exts)
    ]

    if not file_paths:
        logger.warning(f"文件夹 {dir_path} 内未找到支持的文件类型: {allowed_exts}")

    result = count_tokens_from_files(file_paths, encoding)
    result["dir"] = dir_path
    return result


# ---------- CLI 入口 ----------

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法:")
        print("  python -m utils.token_calculation <文件或文件夹路径> [路径2 ...]")
        print("")
        print("示例:")
        print("  python -m utils.token_calculation data/doc.txt")
        print("  python -m utils.token_calculation data/")
        print("  python -m utils.token_calculation a.txt b.pdf c.json")
        sys.exit(1)

    paths = sys.argv[1:]

    if len(paths) == 1 and os.path.isdir(paths[0]):
        output = count_tokens_from_dir(paths[0])
    elif len(paths) == 1:
        output = count_tokens_from_file(paths[0])
    else:
        output = count_tokens_from_files(paths)

    print(json.dumps(output, ensure_ascii=False, indent=2))
