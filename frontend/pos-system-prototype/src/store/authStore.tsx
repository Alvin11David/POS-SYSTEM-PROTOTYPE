import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Role = "admin" | "manager" | "cashier";

export interface User {
  id: string;
  username: string;
  password: string; // demo only — local storage
  fullName: string;
  role: Role;
  createdAt: string;
}

const SESSION_KEY = "jambo_session";

interface AuthCtx {
  users: User[];
  currentUser: User | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addUser: (
    u: Omit<User, "id" | "createdAt">,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (
    id: string,
    u: Partial<Omit<User, "id" | "createdAt">>,
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
  hasRole: (...roles: Role[]) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

type BackendUser = Pick<
  User,
  "id" | "username" | "fullName" | "role" | "createdAt"
>;

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    detail?: string;
  };
  if (!response.ok) {
    throw new Error(data.detail ?? `Request failed: ${response.status}`);
  }

  return data;
}

function toLocalUser(backendUser: BackendUser, password = ""): User {
  return {
    id: backendUser.id,
    username: backendUser.username,
    fullName: backendUser.fullName,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
    password,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser || currentUser.role !== "admin") {
        setUsers([]);
        return;
      }

      try {
        const data = await apiJson<{ users: BackendUser[] }>(
          "/api/auth/users/",
        );
        setUsers(
          data.users.map((entry) =>
            toLocalUser(
              entry,
              entry.id === currentUser.id ? currentUser.password : "",
            ),
          ),
        );
      } catch {
        setUsers([]);
      }
    };

    void loadUsers();
  }, [currentUser]);

  const login: AuthCtx["login"] = async (username, password) => {
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          error: data.detail ?? "Invalid username or password",
        };
      }

      const backendUser = data.user as BackendUser;
      const sessionUser: User = toLocalUser(backendUser, password);

      setCurrentUser(sessionUser);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach the login service" };
    }
  };

  const logout = () => {
    void fetch("/api/auth/logout/", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setCurrentUser(null);
  };

  const addUser: AuthCtx["addUser"] = async (u) => {
    if (!u.username.trim()) return { ok: false, error: "Username required" };
    if (u.password.length < 4)
      return { ok: false, error: "Password must be 4+ characters" };
    try {
      const payload = await apiJson<{ user: BackendUser }>("/api/auth/users/", {
        method: "POST",
        body: JSON.stringify({
          fullName: u.fullName,
          username: u.username.trim(),
          password: u.password,
          role: u.role,
        }),
      });

      setUsers((prev) => [...prev, toLocalUser(payload.user)]);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not add user",
      };
    }
  };

  const updateUser: AuthCtx["updateUser"] = async (id, patch) => {
    const payload: Partial<Omit<User, "id" | "createdAt">> = {
      ...patch,
    };

    if (payload.username !== undefined) {
      payload.username = payload.username.trim();
      if (!payload.username) {
        return { ok: false, error: "Username required" };
      }
    }

    if (
      payload.password !== undefined &&
      payload.password.length > 0 &&
      payload.password.length < 4
    ) {
      return { ok: false, error: "Password must be 4+ characters" };
    }

    try {
      const data = await apiJson<{ user: BackendUser }>(
        `/api/auth/users/${id}/`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? toLocalUser(data.user, payload.password ?? entry.password)
            : entry,
        ),
      );

      if (currentUser?.id === id) {
        setCurrentUser((existing) =>
          existing
            ? toLocalUser(data.user, payload.password ?? existing.password)
            : existing,
        );
      }

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not update user",
      };
    }
  };

  const deleteUser: AuthCtx["deleteUser"] = async (id) => {
    try {
      await apiJson<{ ok: boolean }>(`/api/auth/users/${id}/`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((x) => x.id !== id));
      if (currentUser?.id === id) setCurrentUser(null);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not remove user",
      };
    }
  };

  const hasRole: AuthCtx["hasRole"] = (...roles) =>
    !!currentUser && roles.includes(currentUser.role);

  return (
    <Ctx.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        hasRole,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  cashier: "Cashier",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  admin: "Full access — manage staff, products, sales & reports",
  manager: "View reports, manage products, run sales",
  cashier: "Run sales only",
};
