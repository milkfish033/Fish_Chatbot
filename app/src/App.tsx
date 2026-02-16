import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login";
import MainPage from "@/pages/MainPage";
import ChatPage from "@/pages/ChatPage";
import FloatingChatButton from "@/components/FloatingChatButton";

/** 未登录时重定向到登录页 */
function ProtectedRoute() {
  const { isLoggedIn, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <>
      <Outlet />
      <FloatingChatButton />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<MainPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
