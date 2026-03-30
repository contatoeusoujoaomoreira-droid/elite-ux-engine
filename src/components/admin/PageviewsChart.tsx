import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

interface PageviewsChartProps {
  dailyPageviews: { date: string; views: number }[];
}

const PageviewsChart = ({ dailyPageviews }: PageviewsChartProps) => {
  const chartConfig = useMemo(() => ({
    views: { label: "Pageviews", color: "hsl(43 96% 56%)" },
  }), []);

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold text-foreground">Pageviews por Dia</h2>
        <span className="text-muted-foreground text-xs ml-auto">Últimos 30 dias</span>
      </div>
      {dailyPageviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-12">Nenhum dado de pageview ainda</p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={dailyPageviews} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(43 96% 56%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(43 96% 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" />
            <XAxis dataKey="date" tickFormatter={(v: string) => v.substring(5)} stroke="hsl(0 0% 55%)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(0 0% 55%)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="views" stroke="hsl(43 96% 56%)" strokeWidth={2} fill="url(#goldGradient)" />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
};

export default PageviewsChart;
