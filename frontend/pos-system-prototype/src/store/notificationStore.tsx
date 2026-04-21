import { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationStore | undefined>(
  undefined,
);
const API_BASE = import.meta.env.VITE_API_URL || "";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/notifications/`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications/${id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        if (!res.ok) throw new Error("Failed to update notification");
        await fetchNotifications();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [fetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [notifications, markAsRead]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await Promise.all(notifications.map((n) => deleteNotification(n.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [notifications, deleteNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
