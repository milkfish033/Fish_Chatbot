import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { login, register } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tab = "login" | "register";

export default function LoginPage() {
  const { isLoggedIn, setAuth, isReady } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await login(username, password);
        setAuth(res.token, res.user);
        navigate("/", { replace: true });
      } else {
        const res = await register(username, password, email || undefined);
        setAuth(res.token, res.user);
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light px-4">
      <Card className="w-full max-w-md shadow-card border-brand-blue/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-brand-black">
            {tab === "login" ? "登录" : "注册"}
          </CardTitle>
          <CardDescription className="text-center">
            {tab === "login"
              ? "使用账号密码登录，登录后进入应用"
              : "注册账号，信息将保存到数据库"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
            {tab === "register" && (
              <div className="space-y-2">
                <Label htmlFor="email">邮箱（选填）</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "处理中..." : tab === "login" ? "登录" : "注册"}
            </Button>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={() => {
                setTab(tab === "login" ? "register" : "login");
                setError("");
              }}
            >
              {tab === "login" ? "没有账号？去注册" : "已有账号？去登录"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
