目前已实现功能：
1 RAG检索
2 memory机制，按照user_id存储到数据库中
3 用户登陆系统


开发日志：

2/15/2026
实现agent加history功能时出现问题，发现RunnableWithMessageHistory需要传入runnable对象，不支持传入agent

solution：

去掉了 RunnableWithMessageHistory，改为手动管理历史

invoke 流程变为：加载历史 → 拼接用户消息 → 调用 agent → 保存结果到历史
直接用 {"messages": [...]} 格式传入 agent，和 create_agent 的输入 schema 完全匹配

后续考虑使用langGraph，通过checkpoint实现memory功能

2/17/2026
构建了RAG评估体系，支持召回率，准确率，F1 score， BELU四个指标评估

下一步：

 - 构建text - to - sql Agent作为子agent，负责对数据库的查询管理，实现退换货的服务流程
 - 实现prompt清洗 + 意图识别 
 - 添加工具memory_check，用于对用户长期记忆的查询，获取历史会话中用户的信息，特殊需求等


2/18/2026
实现sql查询子agent模块，sql注入危险检测， prompt清洗，意图识别等功能

下一步：
- 上线demo收集sql模块的用户聊天记录，提取高频操作，实现关键词提取+模块化自动执行，减少agent规划带来的时间损耗，降低首字延迟
- 实现对长期记忆的关键词提取+重要信息输入，加入自动更新，删除，增加记忆模块，维护长期记忆
- 增加sql_bello部分的logger日志模块

