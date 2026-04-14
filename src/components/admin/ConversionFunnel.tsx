import { ArrowDown } from "lucide-react";

interface ConversionFunnelProps {
  pageviews: number;
  planClicks: number;
  waIntents: number;
}

const ConversionFunnel = ({ pageviews, planClicks, waIntents }: ConversionFunnelProps) => {
  const steps = [
    { label: "Visitas", value: pageviews, color: "bg-blue-500" },
    { label: "Cliques em Planos", value: planClicks, color: "bg-primary" },
    { label: "WhatsApp Intent", value: waIntents, color: "bg-green-500" },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-6">Funil de Conversão</h3>
      <div className="flex flex-col items-center gap-2">
        {steps.map((step, i) => {
          const widthPct = pageviews > 0 ? Math.max(30, (step.value / pageviews) * 100) : 30;
          const rate = i > 0 && steps[i - 1].value > 0
            ? ((step.value / steps[i - 1].value) * 100).toFixed(1)
            : null;

          return (
            <div key={step.label} className="w-full flex flex-col items-center">
              {i > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground my-1">
                  <ArrowDown className="w-3 h-3" />
                  <span>{rate}%</span>
                </div>
              )}
              <div
                className={`${step.color} rounded-lg py-3 text-center transition-all duration-500`}
                style={{ width: `${widthPct}%` }}
              >
                <span className="text-white font-bold text-lg">{step.value.toLocaleString()}</span>
                <span className="text-white/80 text-xs block">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
