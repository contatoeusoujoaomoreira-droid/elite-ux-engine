import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PlanPerformanceChartProps {
  planClicks: Record<string, number>;
}

const COLORS = ["#d4a853", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

const PlanPerformanceChart = ({ planClicks }: PlanPerformanceChartProps) => {
  const data = Object.entries(planClicks)
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance por Plano</h3>
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum clique registrado ainda</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Performance por Plano</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={80} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
          />
          <Bar dataKey="clicks" radius={[0, 6, 6, 0]} name="Cliques">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlanPerformanceChart;
