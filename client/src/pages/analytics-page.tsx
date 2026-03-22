import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FileText,
  Users,
  PenTool,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { GeneratedContent } from "@shared/schema";

interface AnalyticsPageProps {
  user: { id: number; companyId: number | null };
}

function getMonthLabel(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function AnalyticsPage({ user }: AnalyticsPageProps) {
  const { data: contentItems, isLoading } = useQuery<GeneratedContent[]>({
    queryKey: ["/api/content", user.companyId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/content/${user.companyId}`);
      return res.json();
    },
    enabled: !!user.companyId,
  });

  const stats = useMemo(() => {
    if (!contentItems || contentItems.length === 0) {
      return {
        yourContent: 0,
        teamContent: 0,
        writingOriginal: 0,
        optimizations: 0,
        avgAlignment: 0,
        contentByType: {} as Record<string, number>,
        chartData: [] as { month: string; you: number; team: number }[],
      };
    }

    const yourItems = contentItems.filter((c) => c.userId === user.id);
    const teamItems = contentItems.filter((c) => c.userId !== user.id);

    // Average alignment from all scores
    const allScores = contentItems
      .map((c) => c.overallScore)
      .filter((s): s is number => s != null);
    const avgAlignment =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    // Content by type
    const contentByType: Record<string, number> = {};
    contentItems.forEach((c) => {
      contentByType[c.contentType] = (contentByType[c.contentType] || 0) + 1;
    });

    // Chart data — last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = getMonthLabel(i);

      const youCount = yourItems.filter((c) => c.createdAt.startsWith(monthKey)).length;
      const teamCount = teamItems.filter((c) => c.createdAt.startsWith(monthKey)).length;

      chartData.push({ month: label, you: youCount, team: teamCount });
    }

    // Writing: count items where category is Traditional
    const writingOriginal = contentItems.filter(
      (c) => c.category === "Traditional"
    ).length;

    // Optimizations: count items not Traditional
    const optimizations = contentItems.filter(
      (c) => c.category !== "Traditional"
    ).length;

    return {
      yourContent: yourItems.length,
      teamContent: teamItems.length,
      writingOriginal,
      optimizations,
      avgAlignment,
      contentByType,
      chartData,
    };
  }, [contentItems, user.id]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6" data-testid="analytics-loading">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const metricCards = [
    {
      title: "Your Content",
      value: stats.yourContent,
      icon: FileText,
      change: "+12%",
      positive: true,
    },
    {
      title: "Team Content",
      value: stats.teamContent,
      icon: Users,
      change: "+8%",
      positive: true,
    },
    {
      title: "Writing",
      value: stats.writingOriginal,
      subtitle: "original / since",
      icon: PenTool,
      change: "+5%",
      positive: true,
    },
    {
      title: "Optimizations",
      value: stats.optimizations,
      subtitle: "pieces refined",
      icon: Sparkles,
      change: "-3%",
      positive: false,
    },
  ];

  const alignmentLabel =
    stats.avgAlignment >= 90
      ? "Excellent"
      : stats.avgAlignment >= 70
        ? "Good"
        : stats.avgAlignment >= 50
          ? "Fair"
          : "Needs Work";

  const alignmentColor =
    stats.avgAlignment >= 90
      ? "bg-green-100 text-green-700"
      : stats.avgAlignment >= 70
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  const sortedTypes = Object.entries(stats.contentByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="w-full space-y-6" data-testid="analytics-page">
      {/* Top row: 4 metric cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid="metric-cards"
      >
        {metricCards.map((card) => (
          <Card key={card.title} data-testid={`card-${card.title.toLowerCase().replace(/\s/g, "-")}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {card.title}
                </span>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {card.subtitle}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {card.positive ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${card.positive ? "text-green-600" : "text-red-500"}`}
                >
                  {card.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row: 3 cards */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        data-testid="middle-cards"
      >
        {/* Average Brand Alignment */}
        <Card data-testid="card-average-alignment">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Brand Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-2">
              <span
                className="text-4xl font-bold"
                data-testid="text-alignment-score"
              >
                {stats.avgAlignment}%
              </span>
              <Badge className={`${alignmentColor} text-xs mb-1`}>
                {alignmentLabel}
              </Badge>
            </div>
            <Progress value={stats.avgAlignment} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Measures how well your content aligns with your brand voice
              profile across tone, vocabulary, consistency, and emotional
              resonance.
            </p>
          </CardContent>
        </Card>

        {/* Content by Tool */}
        <Card data-testid="card-content-by-tool">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Content by Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No content yet</p>
            ) : (
              <div className="space-y-2">
                {sortedTypes.map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                    data-testid={`row-content-type-${type.replace(/[\s/]/g, "-").toLowerCase()}`}
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {type}
                    </span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All-Time Stats */}
        <Card data-testid="card-all-time-stats">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              All-Time Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Your Total Content
              </p>
              <p
                className="text-3xl font-bold"
                data-testid="text-your-total"
              >
                {stats.yourContent}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Team Total Content
              </p>
              <p
                className="text-3xl font-bold"
                data-testid="text-team-total"
              >
                {stats.teamContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Line Chart */}
      <Card data-testid="card-chart">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Content Creation Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full" data-testid="chart-content-over-time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="you"
                  name="You"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="team"
                  name="Team"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
