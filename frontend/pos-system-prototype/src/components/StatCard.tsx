import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning";
}

const toneStyles: Record<string, { bg: string; ring: string; glow: string }> = {
  primary: {
    bg: "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
    ring: "ring-primary/20",
    glow: "from-primary/10",
  },
  success: {
    bg: "bg-gradient-to-br from-success to-success/70 text-success-foreground",
    ring: "ring-success/20",
    glow: "from-success/10",
  },
  warning: {
    bg: "bg-gradient-to-br from-warning to-warning/70 text-warning-foreground",
    ring: "ring-warning/20",
    glow: "from-warning/10",
  },
};

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const t = toneStyles[tone];
  return (
    <Card className="group relative overflow-hidden p-5 shadow-sm border-border/60 transition-spring hover:shadow-elevated hover:-translate-y-1 hover:border-primary/20">
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${t.glow} to-transparent blur-2xl opacity-60 transition-base group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md ring-4 ${t.ring} ${t.bg}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {delta !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
              positive ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="relative mt-5">
        <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-[26px] font-bold tracking-tight leading-none">{value}</p>
      </div>
    </Card>
  );
}
