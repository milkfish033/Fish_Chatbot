# Bello Smart Customer Service Chatbot

基于 LangChain 多智能体架构的智能客服系统，为贝克洛门窗提供产品咨询与订单管理服务。系统融合 RAG 检索增强生成、意图识别路由和 SQL 自动查询能力，实现安全、精准的对话式客户服务。

## 系统架构

```
用户输入
  │
  ▼
┌─────────────────────┐
│   Prompt 安全层      │  ← 输入清洗 + 注入检测
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Router 意图路由    │  ← 退货 / 换货 / 订单查询 / 其他
└────┬───────────┬────┘
     ▼           ▼
┌─────────┐ ┌──────────┐
│ SQL Agent│ │Bello Agent│
│ 订单查询 │ │ 产品咨询  │
│ 退货换货 │ │ RAG 检索  │
└─────────┘ └──────────┘
     │           │
     ▼           ▼
┌─────────────────────┐
│   会话记忆管理       │  ← 基于文件的多轮对话记忆
└─────────────────────┘
```

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| LLM | 通义千问 Qwen3-Max (DashScope API) |
| Agent 框架 | LangChain (React Agent) |
| 向量数据库 | ChromaDB |
| 后端框架 | FastAPI + Uvicorn |
| 数据库 | SQLite + SQLAlchemy |
| 认证 | JWT + bcrypt |
| 前端 | React 19 + TypeScript + Vite |
| UI 组件 | Radix UI + Tailwind CSS |

## 项目结构

```
Fish_Chatbot/
├── agent/                        # 多智能体系统
│   ├── bello.py                  # Bello Agent - RAG 产品咨询
│   ├── router.py                 # 意图识别与路由分发
│   ├── sql_bello.py              # SQL Agent - 订单查询与售后
│   └── tools/                    # 工具定义
│       ├── agent_tools.py        # rag_summarize / execute_sql / load_skill
│       ├── memory.py             # 文件式会话记忆
│       └── middleware.py         # 技能注入中间件
├── agent_skill/                  # Agent 技能库
│   └── skill.py                  # 订单查询技能 (SQL 生成规范)
├── rag/                          # RAG 检索增强生成
│   ├── rag_service.py            # 检索 + LLM 摘要管线
│   └── vector_store.py           # ChromaDB 向量存储 (MD5 去重)
├── web/                          # Web API 层
│   ├── main.py                   # FastAPI 路由 (auth / chat)
│   ├── auth_service.py           # JWT 认证服务
│   ├── database.py               # SQLAlchemy 数据库连接
│   └── models.py                 # 用户 ORM 模型
├── prompts/                      # Prompt 模板与安全过滤
│   ├── main_prompt.txt           # Bello Agent 系统提示词
│   ├── sql_bello_prompt.txt      # SQL Agent 系统提示词
│   ├── intent.txt                # 意图识别提示词
│   ├── rag_sumarize.txt          # RAG 摘要模板
│   ├── Prompt_filtering.py       # 输入清洗与注入检测
│   └── blacklist.json            # 注入关键词黑名单
├── config/                       # YAML 配置文件
│   ├── agent.yml                 # 模型与数据路径
│   ├── web.yml                   # 服务端口 / JWT / 数据库
│   ├── chroma.yml                # 向量存储参数
│   ├── memory.yml                # 会话记忆配置
│   ├── prompts.yml               # Prompt 文件路径
│   └── rag.yml                   # RAG 模型配置
├── utils/                        # 工具函数
│   ├── config_handler.py         # YAML 配置加载
│   ├── prompt_loader.py          # Prompt 模板加载
│   ├── logger_handler.py         # 日志管理
│   ├── path_tool.py              # 路径处理
│   ├── file_handler.py           # 文件读取 / MD5
│   └── user_id_helper.py         # JWT 用户提取
├── app/                          # 前端应用
│   └── src/
│       ├── pages/                # Login / Main / Chat
│       ├── components/           # ChatWidget / Navigation 等
│       └── contexts/             # 认证状态管理
├── data/                         # 数据与知识库
│   ├── order.db                  # 订单数据库
│   ├── web.db                    # 用户数据库
│   └── *.pdf / *.txt / *.json    # 贝克洛门窗产品知识文档
├── chroma_db/                    # ChromaDB 持久化存储
├── logs/                         # 运行日志
├── requirements.txt              # Python 依赖
└── .env                          # 环境变量
```

## 核心功能

### 1. 意图识别与智能路由

Router 节点基于 LLM 对用户输入进行意图分类，支持四种意图：

| 意图 | 路由目标 | 说明 |
|------|---------|------|
| 退货 | SQL Agent | 处理退货申请与查询 |
| 换货 | SQL Agent | 处理换货申请与查询 |
| 订单查询 | SQL Agent | 查询订单状态、物流等信息 |
| 其他 | Bello Agent | 产品咨询、常见问题等 |

### 2. RAG 产品知识问答

- 支持 PDF / TXT / JSON 多格式知识文档导入
- ChromaDB 向量存储，MD5 去重防止重复入库
- Top-5 相似文档检索 + LLM 摘要生成

### 3. SQL 订单查询

- 基于技能系统的 SQL 自动生成
- 参数化查询，强制绑定 `user_id` 防止越权
- 仅允许 SELECT 操作，阻断所有写入/删除语句

### 4. 安全防护

- **Prompt 注入检测**：正则黑名单匹配，拦截常见注入模式
- **输入清洗**：Emoji 移除、Unicode 规范化、特殊字符过滤
- **SQL 安全**：参数化查询、SELECT-only、行数限制 (max 100)
- **认证鉴权**：JWT Token 验证，bcrypt 密码加密

### 5. 多轮对话记忆

- 基于文件的会话持久化存储 (`data/chat_memory/`)
- 按用户隔离会话上下文
- 可配置最大记忆轮次 (默认 10 轮)

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- DashScope API Key (阿里云通义千问)

### 1. 安装后端依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
DASHSCOPE_API_KEY=your_dashscope_api_key
```

### 3. 启动后端服务

```bash
python -m web.main
```

服务默认运行在 `http://localhost:5000`

### 4. 启动前端应用

```bash
cd app
npm install
npm run dev
```

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | - |
| POST | `/api/auth/login` | 用户登录，返回 JWT | - |
| POST | `/api/chat` | 发送消息，获取 AI 回复 | Bearer Token |

### 对话请求示例

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "我想查询一下订单状态"}'
```

## 数据库设计

### 订单表 (orders)

| 字段 | 类型 | 说明 |
|------|------|------|
| order_no | VARCHAR(50) | 订单编号 (e.g. ORD-20260201-001) |
| user_id | INTEGER | 用户 ID |
| total_amount | DECIMAL(10,2) | 订单金额 |
| status | VARCHAR(20) | 状态: pending / completed / shipped / cancelled / refunded |
| shipping_name | VARCHAR(100) | 收件人 |
| shipping_phone | VARCHAR(20) | 联系电话 |
| shipping_address | TEXT | 收货地址 |

### 订单明细表 (order_items)

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | INTEGER | 关联订单 ID |
| product_name | VARCHAR(100) | 产品名称 |
| quantity | INTEGER | 数量 |
| unit | VARCHAR(20) | 单位 (樘 / 扇) |
| unit_price | DECIMAL(10,2) | 单价 |
| subtotal | DECIMAL(10,2) | 小计 |

## 配置说明

所有配置文件位于 `config/` 目录，采用 YAML 格式：

| 配置文件 | 主要参数 |
|---------|---------|
| `agent.yml` | 模型名称、外部数据路径 |
| `web.yml` | 服务端口、JWT 密钥与过期时间、数据库路径 |
| `chroma.yml` | 向量集合名、分块大小 (200)、重叠 (20)、检索数 (5) |
| `memory.yml` | 记忆存储路径、最大轮次 (10) |
| `rag.yml` | Chat / Embedding 模型名称 |

## License

MIT
