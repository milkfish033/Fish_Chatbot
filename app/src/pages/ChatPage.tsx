import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Loader2, ArrowLeft, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/contexts/AuthContext";
import { sendChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default function ChatPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !token) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const { reply } = await sendChatMessage(text, token);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900">
      {/* 左侧：历史会话列表（预留） */}
      <aside
        className={cn(
          "flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-300 shrink-0",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* 预留：历史会话列表 */}
          <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500 text-sm">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p>历史会话</p>
            <p className="mt-1 text-xs text-gray-400">即将推出</p>
          </div>
        </div>
      </aside>

      {/* 主区域：聊天 */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="切换侧边栏"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Bello 智能助手</span>
          </div>
          <div className="w-10" />
        </header>

        {/* 消息区域 */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-blue-600/20 flex items-center justify-center mb-6 ring-1 ring-gray-200">
                  <MessageCircle className="h-8 w-8 text-brand-blue" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">您好，我是 Bello</h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  贝克洛智能助手，有什么可以帮您的？输入您的问题开始对话。
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {["门窗产品咨询", "报价与定制", "安装服务", "售后服务"].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-200 hover:border-brand-blue/50 hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex mb-6",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                    m.role === "user"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 border border-gray-200 text-gray-800"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-gray max-w-none break-words prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-code:before:content-none prose-code:after:content-none prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-6">
                <div className="rounded-2xl px-4 py-3 bg-gray-100 border border-gray-200">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </main>

        {/* 底部固定输入框 */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-4">
          {error && (
            <div className="mx-auto max-w-3xl mb-3 px-4 py-2 rounded-lg text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}
          <div className="mx-auto max-w-3xl flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-brand-blue focus-visible:border-brand-blue"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-12 px-5 rounded-xl bg-brand-blue hover:bg-blue-700 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
