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