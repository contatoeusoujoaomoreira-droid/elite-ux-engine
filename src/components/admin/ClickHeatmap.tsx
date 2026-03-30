import { MousePointerClick } from "lucide-react";

interface ClickHeatmapProps {
  planClicks: Record<string, number>;
}

const ClickHeatmap = ({ planClicks }: ClickHeatmapProps) => {
  const maxClicks = Math.max(...Object.values(planClicks), 1);

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <MousePointerClick className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold text-foreground">Heatmap de Cliques por Plano</h2>
      </div>
      <div className="space-y-3">
        {["Hora", "Diária", "Mensal"].map((plan) => {
          const count = planClicks[plan] || 0;
          const pct = maxClicks > 0 ? (count / maxClicks) * 100 : 0;
          return (
            <div key={plan} className="flex items-center gap-4">
              <span className="text-foreground text-sm w-16">{plan}</span>
              <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                <div className="h-full bg-primary/50 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-muted-foreground text-sm w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClickHeatmap;
