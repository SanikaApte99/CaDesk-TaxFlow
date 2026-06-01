import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlarmClock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Urgency = "urgent" | "soon" | "upcoming" | "done";

interface Deadline {
  id: string;
  name: string;
  sub: string;
  date: string;
  daysLabel: string;
  urgency: Urgency;
}

const deadlines: Deadline[] = [
  {
    id: "1",
    name: "GSTR-3B (April)",
    sub: "Monthly GST return",
    date: "20 May",
    daysLabel: "3 days",
    urgency: "urgent",
  },
];

const urgencyConfig: Record<
  Urgency,
  { badgeCls: string; label?: string; icon?: React.ElementType }
> = {
  urgent: {
    badgeCls: "bg-red-100   text-red-800   border-red-200",
    icon: AlarmClock,
  },
  soon: { badgeCls: "bg-amber-100 text-amber-800 border-amber-200" },
  upcoming: { badgeCls: "bg-blue-100  text-blue-800  border-blue-200" },
  done: {
    badgeCls: "bg-green-100 text-green-800 border-green-200",
    icon: Check,
  },
};

export function DeadlineList() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Upcoming deadlines
          </CardTitle>
          <button className="text-xs text-blue-600 hover:underline">
            Full calendar →
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="space-y-0">
          {deadlines.map((dl, i) => {
            const config = urgencyConfig[dl.urgency];
            const Icon = config.icon;
            return (
              <div
                key={dl.id}
                className={cn(
                  "flex items-center justify-between gap-3 py-2.5",
                  i < deadlines.length - 1 && "border-b",
                )}
              >
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      dl.urgency === "done" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {dl.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{dl.sub}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dl.urgency !== "done" && (
                    <span className="text-xs text-muted-foreground">
                      {dl.date}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] font-medium gap-1",
                      config.badgeCls,
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {dl.daysLabel}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
