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

const USERS_KEY = "jambo_users";
const SESSION_KEY = "jambo_session";

const defaultUsers: User[] = [
  {
    id: "u-admin",
    username: "admin",
    password: "admin123",
    fullName: "Store Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

interface AuthCtx {
  users: User[];
  currentUser: User | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addUser: (u: Omit<User, "id" | "createdAt">) => {
    ok: boolean;
    error?: string;
  };
  updateUser: (id: string, u: Partial<Omit<User, "id" | "createdAt">>) => void;
  deleteUser: (id: string) => void;
  hasRole: (...roles: Role[]) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

type BackendUser = Pick<User, "id" | "username" | "fullName" | "role">;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : defaultUsers;
    } catch {
      return defaultUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
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
      const localUser = users.find(
        (entry) =>
          entry.username.toLowerCase() === backendUser.username.toLowerCase(),
      );
      const sessionUser: User = localUser
        ? {
            ...localUser,
            ...backendUser,
            password,
          }
        : {
            id: backendUser.id,
            username: backendUser.username,
            password,
            fullName: backendUser.fullName,
            role: backendUser.role,
            createdAt: new Date().toISOString(),
          };

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

  const addUser: AuthCtx["addUser"] = (u) => {
    if (!u.username.trim()) return { ok: false, error: "Username required" };
    if (u.password.length < 4)
      return { ok: false, error: "Password must be 4+ characters" };
    if (
      users.some(
        (x) => x.username.toLowerCase() === u.username.trim().toLowerCase(),
      )
    )
      return { ok: false, error: "Username already exists" };
    const newUser: User = {
      ...u,
      username: u.username.trim(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return { ok: true };
  };

  const updateUser: AuthCtx["updateUser"] = (id, patch) => {
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (currentUser?.id === id) {
      setCurrentUser((c) => (c ? { ...c, ...patch } : c));
    }
  };

  const deleteUser: AuthCtx["deleteUser"] = (id) => {
    setUsers((prev) => prev.filter((x) => x.id !== id));
    if (currentUser?.id === id) setCurrentUser(null);
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
