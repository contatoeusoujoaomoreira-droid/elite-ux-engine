import { TrendingUp, TrendingDown, Users, Target, Clock } from "lucide-react";

interface AnalyticsOverviewProps {
  totalPageviews: number;
  uniqueVisitors: number;
  conversionRate: string;
  previousPageviews?: number;
  previousVisitors?: number;
}

const AnalyticsOverview = ({
  totalPageviews,
  uniqueVisitors,
  conversionRate,
  previousPageviews = 0,
  previousVisitors = 0,
}: AnalyticsOverviewProps) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const pageviewsChange = calculateChange(totalPageviews, previousPageviews);
  const visitorsChange = calculateChange(uniqueVisitors, previousVisitors);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    unit = "",
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    change?: number;
    unit?: string;
  }) => (
    <div className="glass-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {Icon}
          </div>
          <span className="text-muted-foreground text-sm">{label}</span>
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
              change >= 0
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="font-serif text-3xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<Clock className="w-5 h-5 text-primary" />}
        label="Pageviews"
        value={totalPageviews}
        change={pageviewsChange}
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-primary" />}
        label="Visitantes Únicos"
        value={uniqueVisitors}
        change={visitorsChange}
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-primary" />}
        label="Taxa de Conversão"
        value={conversionRate}
        unit="%"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
        label="Tendência"
        value={pageviewsChange >= 0 ? "↑ Positiva" : "↓ Negativa"}
      />
    </div>
  );
};

export default AnalyticsOverview;
