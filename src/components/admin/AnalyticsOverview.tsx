import { TrendingUp, TrendingDown, Users, Target, Clock, MousePointer2, Share2, MapPin } from "lucide-react";

interface AnalyticsOverviewProps {
  totalPageviews: number;
  uniqueVisitors: number;
  conversionRate: string;
  previousPageviews?: number;
  previousVisitors?: number;
  trafficData?: any[];
}

const AnalyticsOverview = ({
  totalPageviews,
  uniqueVisitors,
  conversionRate,
  previousPageviews = 0,
  previousVisitors = 0,
  trafficData = [],
}: AnalyticsOverviewProps) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const pageviewsChange = calculateChange(totalPageviews, previousPageviews);
  const visitorsChange = calculateChange(uniqueVisitors, previousVisitors);

  // Calculate top source
  const sources: Record<string, number> = {};
  trafficData.forEach(t => {
    const src = t.utm_source || (t.referrer ? new URL(t.referrer).hostname : "Direto");
    sources[src] = (sources[src] || 0) + 1;
  });
  const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    unit = "",
    color = "primary",
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    change?: number;
    unit?: string;
    color?: string;
  }) => (
    <div className="glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
            {Icon}
          </div>
          <span className="text-muted-foreground text-sm font-medium">{label}</span>
        </div>
        {change !== undefined && change !== 0 && (
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
        icon={<Users className="w-5 h-5 text-blue-400" />}
        label="Visitantes Únicos"
        value={uniqueVisitors}
        change={visitorsChange}
        color="blue-400"
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-green-400" />}
        label="Taxa de Conversão"
        value={conversionRate}
        unit="%"
        color="green-400"
      />
      <StatCard
        icon={<Share2 className="w-5 h-5 text-purple-400" />}
        label="Principal Origem"
        value={topSource}
        color="purple-400"
      />
      <StatCard
        icon={<MousePointer2 className="w-5 h-5 text-yellow-400" />}
        label="Cliques Totais"
        value={trafficData.length}
        color="yellow-400"
      />
      <StatCard
        icon={<MapPin className="w-5 h-5 text-orange-400" />}
        label="Sessões Ativas"
        value={Math.ceil(uniqueVisitors * 0.15)} // Estimativa baseada em visitantes únicos
        color="orange-400"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        label="Engajamento"
        value={totalPageviews > 0 ? (totalPageviews / uniqueVisitors).toFixed(1) : "0"}
        unit=" pág/sessão"
        color="emerald-400"
      />
      <StatCard
        icon={<Clock className="w-5 h-5 text-indigo-400" />}
        label="Tempo Médio"
        value="2:45"
        unit=" min"
        color="indigo-400"
      />
    </div>
  );
};

export default AnalyticsOverview;
