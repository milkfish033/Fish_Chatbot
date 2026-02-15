/**
 * 后端 API 基础地址与认证接口
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface UserInfo {
  id: number;
  username: string;
  email: string | null;
  created_at: string | null;
  last_login_at: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "登录失败");
  }
  return res.json();
}

export async function register(
  username: string,
  password: string,
  email?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email: email || null }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "注册失败");
  }
  return res.json();
}

/** 聊天消息接口（调用 Bello 智能助手） */
export interface ChatResponse {
  reply: string;
}

export async function sendChatMessage(
  message: string,
  token: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "发送失败");
  }
  return res.json();
}
