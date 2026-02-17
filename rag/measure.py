"""
RAG 评估模块
支持指标: Recall@K, Precision@K, F1 Score, BLEU
"""

import json
from collections import Counter
from rag.vector_store import VectorStoreService
from rag.rag_service import RagSummarizeService
from langchain_core.documents import Document
from utils.logger_handler import logger
from utils.config_handler import rag_conf
from utils.path_tool import get_abs_path
from utils.file_handler import json_loader

def tokenize(text: str) -> list[str]:
    """简单中文分词：按字符切分，过滤空白"""
    return [ch for ch in text if not ch.isspace()]


# ==================== 检索质量指标 ====================

def recall_at_k(retrieved_ids: list[str], relevant_ids: list[str]) -> float:
    """
    Recall@K: 在检索到的K个文档中，命中了多少个相关文档
    Recall@K = |retrieved ∩ relevant| / |relevant|
    """
    if not relevant_ids:
        return 0.0
    retrieved_set = set(retrieved_ids)
    relevant_set = set(relevant_ids)
    return len(retrieved_set & relevant_set) / len(relevant_set)


def precision_at_k(retrieved_ids: list[str], relevant_ids: list[str]) -> float:
    """
    Precision@K: 检索到的K个文档中，有多少是相关的
    Precision@K = |retrieved ∩ relevant| / |retrieved|
    """
    if not retrieved_ids:
        return 0.0
    retrieved_set = set(retrieved_ids)
    relevant_set = set(relevant_ids)
    return len(retrieved_set & relevant_set) / len(retrieved_set)


def f1_score(precision: float, recall: float) -> float:
    """
    F1 Score: Precision 和 Recall 的调和平均
    F1 = 2 * P * R / (P + R)
    """
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)


# ==================== 生成质量指标 ====================

def bleu_score(reference: str, candidate: str, max_n: int = 4) -> float:
    """
    BLEU Score: 评估生成文本与参考答案的n-gram重合度
    使用简化版BLEU（不含brevity penalty的基础版本会偏高，这里加上BP）
    """
    ref_tokens = tokenize(reference)
    cand_tokens = tokenize(candidate)

    if not cand_tokens or not ref_tokens:
        return 0.0

    # Brevity Penalty
    bp = min(1.0, len(cand_tokens) / len(ref_tokens))

    scores = []
    for n in range(1, max_n + 1):
        ref_ngrams = Counter(
            tuple(ref_tokens[i:i + n]) for i in range(len(ref_tokens) - n + 1)
        )
        cand_ngrams = Counter(
            tuple(cand_tokens[i:i + n]) for i in range(len(cand_tokens) - n + 1)
        )

        # 截断计数：每个n-gram最多计参考中出现的次数
        clipped = sum(min(count, ref_ngrams[ng]) for ng, count in cand_ngrams.items())
        total = sum(cand_ngrams.values())

        if total == 0:
            return 0.0

        scores.append(clipped / total)

    if not scores or any(s == 0 for s in scores):
        return 0.0

    # 几何平均
    log_avg = sum(s for s in scores) / len(scores)  # 简化：用算术平均近似
    import math
    geo_mean = math.exp(sum(math.log(s) for s in scores) / len(scores))

    return bp * geo_mean


# ==================== 评估器 ====================

class RAGEvaluator:
    """
    RAG 评估器

    测试数据格式 (JSON):
    [
        {
            "query": "贝克洛有哪些产品？",
            "relevant_contents": ["铝合金门窗", "幕墙系统", ...],  # 期望检索到的关键内容片段
            "reference_answer": "贝克洛的产品包括..."                # 期望的参考答案
        },
        ...
    ]

    relevant_contents: 用于匹配检索到的文档（子串匹配），评估检索质量
    reference_answer: 用于和RAG生成的答案做BLEU对比，评估生成质量
    """

    def __init__(self):
        self.rag_service = RagSummarizeService()
        self.retriever = self.rag_service.retriever

    def _match_relevant(self, doc: Document, relevant_contents: list[str]) -> list[str]:
        """检查文档内容是否包含任一相关内容片段，返回匹配到的片段"""
        matched = []
        for content in relevant_contents:
            if content in doc.page_content:
                matched.append(content)
        return matched

    def evaluate_single(self, query: str, relevant_contents: list[str],
                        reference_answer: str = "") -> dict:
        """评估单条查询"""
        # 检索
        retrieved_docs: list[Document] = self.retriever.invoke(query)

        # 把 relevant_contents 当作 relevant_ids，
        # 检查每个 retrieved doc 匹配了哪些 relevant content
        matched_contents = set()
        for doc in retrieved_docs:
            matched_contents.update(self._match_relevant(doc, relevant_contents))

        retrieved_ids = list(matched_contents)
        relevant_ids = relevant_contents

        r = recall_at_k(retrieved_ids, relevant_ids)
        p = precision_at_k(retrieved_ids, relevant_ids)
        f1 = f1_score(p, r)

        result = {
            "query": query,
            "recall@k": round(r, 4),
            "precision@k": round(p, 4),
            "f1_score": round(f1, 4),
            "retrieved_count": len(retrieved_docs),
            "matched_relevant": list(matched_contents),
        }

        # BLEU（如果有参考答案）
        if reference_answer:
            generated_answer = self.rag_service.rag_summarize(query)
            bleu = bleu_score(reference_answer, generated_answer)
            result["bleu"] = round(bleu, 4)
            result["generated_answer"] = generated_answer
            result["reference_answer"] = reference_answer

        return result


    def evaluate_dataset(self, test_data: list[dict]) -> dict:
        """
        批量评估整个测试集

        参数:
            test_data: 测试数据列表，每项包含 query, relevant_contents, reference_answer(可选)

        返回:
            包含每条结果和整体平均指标的字典
        """
        results = []
        total_recall = 0.0
        total_precision = 0.0
        total_f1 = 0.0
        total_bleu = 0.0
        bleu_count = 0



        for i, item in enumerate(test_data):
            logger.info(f"评估第 {i + 1}/{len(test_data)} 条: {item['query']}")
            result = self.evaluate_single(
                query=item["query"],
                relevant_contents=item.get("relevant_contents", []),
                reference_answer=item.get("reference_answer", ""),
            )
            results.append(result)

            total_recall += result["recall@k"]
            total_precision += result["precision@k"]
            total_f1 += result["f1_score"]
            if "bleu" in result:
                total_bleu += result["bleu"]
                bleu_count += 1

        n = len(test_data)
        summary = {
            "total_queries": n,
            "avg_recall@k": round(total_recall / n, 4) if n else 0,
            "avg_precision@k": round(total_precision / n, 4) if n else 0,
            "avg_f1_score": round(total_f1 / n, 4) if n else 0,
        }
        if bleu_count:
            summary["avg_bleu"] = round(total_bleu / bleu_count, 4)

        return {"summary": summary, "details": results}

    def evaluate_from_file(self, filepath: str) -> dict:
        """从JSON文件加载测试数据并评估"""
        with open(filepath, "r", encoding="utf-8") as f:
            test_data = json.load(f)
        return self.evaluate_dataset(test_data)

    def print_report(self, eval_result: dict):
        """打印评估报告"""
        summary = eval_result["summary"]
        details = eval_result["details"]

        print("=" * 60)
        print("RAG 评估报告")
        print("=" * 60)
        print(f"测试样本数: {summary['total_queries']}")
        print(f"平均 Recall@K:    {summary['avg_recall@k']}")
        print(f"平均 Precision@K: {summary['avg_precision@k']}")
        print(f"平均 F1 Score:    {summary['avg_f1_score']}")
        if "avg_bleu" in summary:
            print(f"平均 BLEU:        {summary['avg_bleu']}")
        print("-" * 60)

        for i, detail in enumerate(details):
            print(f"\n[Query {i + 1}] {detail['query']}")
            print(f"  Recall@K:    {detail['recall@k']}")
            print(f"  Precision@K: {detail['precision@k']}")
            print(f"  F1 Score:    {detail['f1_score']}")
            print(f"  匹配到的相关内容: {detail['matched_relevant']}")
            if "bleu" in detail:
                print(f"  BLEU:        {detail['bleu']}")
                print(f"  生成答案: {detail['generated_answer'][:100]}...")
        print("=" * 60)


if __name__ == "__main__":
    # 示例测试数据 - 请根据实际知识库内容修改
    # test_data = [
    #     {
    #         "query": "贝克洛有哪些产品？",
    #         "relevant_contents": ["门窗", "幕墙"],
    #         "reference_answer": "贝克洛的产品包括铝合金门窗系统和幕墙系统。",
    #     },
    # ]

    # evaluator = RAGEvaluator()
    # result = evaluator.evaluate_dataset(test_data)
    # evaluator.print_report(result)

    test_dataset = json_loader(get_abs_path(rag_conf["test_path"]))
    evaluator = RAGEvaluator()
    result = evaluator.evaluate_dataset(test_dataset)
    evaluator.print_report(result)


