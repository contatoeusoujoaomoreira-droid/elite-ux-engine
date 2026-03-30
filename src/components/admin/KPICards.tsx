import { Eye, Globe, MousePointerClick } from "lucide-react";

interface KPICardsProps {
  totalPageviews: number;
  uniqueVisitors: number;
  conversionRate: string;
}

const KPICards = ({ totalPageviews, uniqueVisitors, conversionRate }: KPICardsProps) => {
  const kpiCards = [
    { icon: Eye, label: "Pageviews Totais", value: totalPageviews.toLocaleString(), sub: "Todas as visitas" },
    { icon: Globe, label: "Visitantes Únicos", value: uniqueVisitors.toLocaleString(), sub: "Sessões únicas" },
    { icon: MousePointerClick, label: "Taxa de Conversão", value: `${conversionRate}%`, sub: "Cliques WhatsApp / Visitas" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {kpiCards.map((kpi) => (
        <div key={kpi.label} className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <kpi.icon className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground text-sm">{kpi.label}</span>
          </div>
          <p className="font-serif text-3xl font-bold text-foreground">{kpi.value}</p>
          <p className="text-muted-foreground text-xs mt-1">{kpi.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
