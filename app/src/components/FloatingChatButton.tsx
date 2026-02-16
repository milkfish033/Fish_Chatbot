import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

/**
 * 右下角浮动聊天按钮
 * 点击后跳转到 /chat 全屏聊天页面
 * 在 /chat 页面不显示
 */
export default function FloatingChatButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/chat") return null;

  return (
    <button
      onClick={() => navigate("/chat")}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/30 hover:bg-blue-700 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-gray-100"
      aria-label="在线咨询"
      title="在线咨询"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
