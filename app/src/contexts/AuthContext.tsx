import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserInfo } from "@/lib/api";

const TOKEN_KEY = "fish_chatbot_token";
const USER_KEY = "fish_chatbot_user";

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isReady: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isReady: false,
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    let user: UserInfo | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr) as UserInfo;
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setState({ token, user, isReady: true });
  }, []);

  const setAuth = useCallback((token: string, user: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((s) => ({ ...s, token, user }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState((s) => ({ ...s, token: null, user: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    setAuth,
    logout,
    isLoggedIn: !!state.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
