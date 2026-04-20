import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash2,
  CheckAll,
  Bell,
  BellOff,
} from "lucide-react";
import { useNotification } from "@/store/notificationStore";

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/20";
      case "error":
        return "bg-destructive/10 border-destructive/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "info":
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success-soft text-success";
      case "error":
        return "bg-destructive/15 text-destructive";
      case "warning":
        return "bg-warning-soft text-warning";
      case "info":
      default:
        return "bg-primary-soft text-primary";
    }
  };

  return (
    <div className="relative mx-auto max-w-375 space-y-6" data-tour="notifications-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden rounded-4xl">
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_30%_35%,hsl(var(--primary)/0.14),transparent_58%),radial-gradient(35%_45%_at_85%_20%,hsl(var(--success)/0.16),transparent_65%)]" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-slate-900 via-slate-900 to-primary/75 p-5 text-primary-foreground shadow-elevated sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(0_0%_100%/0.15),transparent_40%)]" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-success/20 blur-3xl" />

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Message Center
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Stay updated with system alerts, order updates, and important events.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {notifications.length > 0 && (
              <>
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 font-semibold rounded-xl"
                >
                  <CheckAll className="h-4 w-4" /> Mark all read
                </Button>
                <Button
                  onClick={deleteAllNotifications}
                  variant="outline"
                  className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 font-semibold rounded-xl"
                >
                  <Trash2 className="h-4 w-4" /> Clear all
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-border/60 bg-linear-to-b from-card to-background/40 p-12 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BellOff className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">You're all caught up!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No new notifications at the moment. Check back later for updates.
          </p>
        </Card>
      ) : (
        <>
          {unreadCount > 0 && (
            <Card className="border-primary/20 bg-primary/5 p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  You have{" "}
                  <span className="text-primary">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</span>
                </p>
                <Button
                  onClick={markAllAsRead}
                  size="sm"
                  className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Mark as read
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-border/60 p-4 shadow-soft transition-base hover:shadow-md sm:p-5 ${
                  !notification.isRead
                    ? "border-primary/30 bg-linear-to-r from-primary/5 to-background/40"
                    : "bg-linear-to-b from-card to-background/40"
                }`}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 pt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge className={`rounded-full border-0 px-2 py-0.5 text-xs font-semibold ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-1.5">
                        {!notification.isRead && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs rounded-lg hover:bg-primary/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
