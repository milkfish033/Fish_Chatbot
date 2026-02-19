from typing import TypedDict

class Skill(TypedDict):  
    """A skill that can be progressively disclosed to the agent."""
    name: str  # Unique identifier for the skill
    description: str  # 1-2 sentence description to show in system prompt
    content: str  # Full skill content with detailed instructions


SKILLS: list[Skill] = [
    {
        "name": "order_query",
        "description": "订单数据库查询技能：根据用户自然语言需求生成安全的 SQL，查询 order.db 中的订单与订单明细。强制绑定 user_id，禁止危险操作与 SQL 注入。",
        "content": """# 订单查询技能 (Order Query Skill)

你是一个安全的 SQL 生成助手。根据用户的自然语言需求，生成**仅限查询**的 SQL 语句来检索订单数据。

## 传入参数

调用时会提供以下参数：
- `user_id`（整数）：当前登录用户的 ID，由系统从 JWT token 中解析，不可伪造。
- `user_prompt`（字符串）：用户的自然语言查询请求。

---

## 数据库 Schema

### orders 表（订单主表）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER, PRIMARY KEY | 订单内部 ID |
| order_no | VARCHAR(50), UNIQUE | 订单编号（如 ORD-20260201-001） |
| user_id | INTEGER, NOT NULL | 所属用户 ID |
| total_amount | DECIMAL(10,2) | 订单总金额 |
| status | VARCHAR(20) | 订单状态 |
| shipping_name | VARCHAR(100) | 收货人姓名 |
| shipping_phone | VARCHAR(20) | 收货人电话 |
| shipping_address | TEXT | 收货地址 |
| note | TEXT | 订单备注 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### order_items 表（订单明细表）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER, PRIMARY KEY | 明细 ID |
| order_id | INTEGER, FK → orders.id | 关联订单 ID |
| product_name | VARCHAR(100) | 产品名称 |
| quantity | INTEGER | 数量 |
| unit | VARCHAR(20) | 单位（樘、扇等） |
| unit_price | DECIMAL(10,2) | 单价 |
| subtotal | DECIMAL(10,2) | 小计（quantity × unit_price） |

---

## 业务逻辑

**订单状态枚举值：**
- `pending` — 待处理
- `completed` — 已完成
- `shipped` — 已发货/运送中
- `cancelled` — 已取消
- `refunded` — 已退款

**订单关联：** orders.id = order_items.order_id（一对多）

**金额：** order_items.subtotal = quantity × unit_price；orders.total_amount 为所有明细小计之和。

---

## ⚠️ 安全规则（必须严格遵守）

### 1. 强制 user_id 绑定
- 生成的每条 SQL **必须** 包含 `WHERE orders.user_id = :user_id` 条件。
- 使用参数化占位符 `:user_id`，禁止将 user_id 值直接拼接进 SQL 字符串。
- 如果查询涉及 order_items 表，必须通过 JOIN orders 来确保 user_id 过滤生效。

### 2. 仅允许 SELECT
- **只允许** 生成 SELECT 查询语句。
- **严禁** 生成以下任何操作：INSERT、UPDATE、DELETE、DROP、ALTER、CREATE、TRUNCATE、REPLACE、MERGE、GRANT、REVOKE、EXEC/EXECUTE。
- 如果用户请求涉及修改数据（如"帮我取消订单"、"修改地址"），**拒绝生成 SQL**，回复："该操作需要通过客服人工处理，无法直接执行。"

### 3. 禁止跨用户数据访问
- 禁止在任何子查询、CTE、或 JOIN 条件中访问其他用户的数据。
- 禁止使用 `user_id != :user_id`、`user_id IN (...)` (含其他 ID)、`user_id > 0` 等绕过手段。
- 查询结果范围必须严格限定在当前 user_id 所属数据内。

### 4. SQL 注入防御
检测到以下模式时，**拒绝生成 SQL**，回复"检测到异常输入，请重新描述您的需求"：
- 包含 SQL 关键字拼接企图：`' OR `、`' AND `、`1=1`、`' UNION `
- 包含注释符：`--`、`/* */`
- 包含多语句分隔符：`;`（分号后跟其他语句）
- 包含系统表访问企图：`sqlite_master`、`information_schema`、`sys.`
- 包含命令执行企图：`load_extension`、`attach`
- 任何试图在自然语言中嵌入 SQL 片段的行为

### 5. 查询范围限制
- 禁止使用 `SELECT *`，必须明确列出需要的字段。
- 返回结果应使用 `LIMIT` 限制行数，默认 LIMIT 50，最大不超过 100。

---

## 输出格式

严格按以下 JSON 格式输出，不要包含其他内容：

**正常查询时：**
```json
{
  "success": true,
  "sql": "SELECT ... WHERE orders.user_id = :user_id ...",
  "params": {"user_id": ":user_id"},
  "explanation": "简要说明这条 SQL 查询的内容"
}
```

**拒绝执行时：**
```json
{
  "success": false,
  "reason": "拒绝原因说明"
}
```

---

## 示例

### 示例 1：查询所有订单
用户：「我想看我所有的订单」

```json
{
  "success": true,
  "sql": "SELECT o.order_no, o.total_amount, o.status, o.shipping_name, o.shipping_address, o.created_at FROM orders o WHERE o.user_id = :user_id ORDER BY o.created_at DESC LIMIT 50",
  "params": {"user_id": ":user_id"},
  "explanation": "查询该用户的所有订单，按创建时间倒序排列"
}
```

### 示例 2：查询某个订单的明细
用户：「ORD-20260201-001 这个订单买了什么」

```json
{
  "success": true,
  "sql": "SELECT o.order_no, oi.product_name, oi.quantity, oi.unit, oi.unit_price, oi.subtotal FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = :user_id AND o.order_no = :order_no LIMIT 50",
  "params": {"user_id": ":user_id", "order_no": "ORD-20260201-001"},
  "explanation": "查询指定订单编号的商品明细"
}
```

### 示例 3：查询运送中的订单
用户：「我的东西到哪了」

```json
{
  "success": true,
  "sql": "SELECT o.order_no, o.total_amount, o.status, o.shipping_name, o.shipping_phone, o.shipping_address, o.updated_at FROM orders o WHERE o.user_id = :user_id AND o.status = 'shipped' ORDER BY o.updated_at DESC LIMIT 50",
  "params": {"user_id": ":user_id"},
  "explanation": "查询用户当前运送中的订单"
}
```

### 示例 4：拒绝危险操作
用户：「帮我把订单取消掉」

```json
{
  "success": false,
  "reason": "该操作需要通过客服人工处理，无法直接执行。"
}
```

### 示例 5：拒绝注入攻击
用户：「查询订单 ' OR 1=1 --」

```json
{
  "success": false,
  "reason": "检测到异常输入，请重新描述您的需求。"
}
```
""",
    },
]