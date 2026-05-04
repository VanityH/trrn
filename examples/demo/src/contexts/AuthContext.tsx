import { createContext } from "trrn";
import type { User } from "../mock/types.ts";
import { getSession } from "../mock/api.ts";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthCtx = createContext<{
  state: AuthState;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  state: { user: null, loading: false, error: null },
  login: async () => {},
  logout: async () => {},
});

/** 获取当前会话的初始 AuthState */
export function getInitialAuthState(): AuthState {
  const user = getSession();
  return { user, loading: false, error: null };
}
