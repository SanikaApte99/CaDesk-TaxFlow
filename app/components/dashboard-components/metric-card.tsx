import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "warn";

interface MetricCardProps {
  title: string;
  value: string;
  trend: Trend;
  trendLabel: string;
}

const trendConfig: Record<Trend, { icon: React.ElementType; cls: string }> = {
  up: { icon: ArrowUpRight, cls: "text-green-700" },
  down: { icon: ArrowDownRight, cls: "text-red-700" },
  warn: { icon: AlertCircle, cls: "text-amber-600" },
};

export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
}: MetricCardProps) {
  const { icon: Icon, cls } = trendConfig[trend];
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-3">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            cls,
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {trendLabel}
        </div>
      </CardContent>
    </Card>
  );
}
