import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  totalPageviews: number;
  uniqueVisitors: number;
  conversionRate: string;
  planClicks: Record<string, number>;
  trafficData: any[];
  dailyPageviews: { date: string; views: number }[];
  startDate: Date;
  endDate: Date;
}

const ExportButton = ({
  totalPageviews, uniqueVisitors, conversionRate,
  planClicks, trafficData, dailyPageviews, startDate, endDate,
}: ExportButtonProps) => {
  const handleExport = () => {
    const lines: string[] = [];
    lines.push(`Relatório Ellite Coworking - ${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}`);
    lines.push("");
    lines.push("=== KPIs ===");
    lines.push(`Pageviews,${totalPageviews}`);
    lines.push(`Visitantes Únicos,${uniqueVisitors}`);
    lines.push(`Taxa de Conversão,${conversionRate}%`);
    lines.push("");
    lines.push("=== Cliques por Plano ===");
    lines.push("Plano,Cliques");
    Object.entries(planClicks).forEach(([name, count]) => lines.push(`${name},${count}`));
    lines.push("");
    lines.push("=== Pageviews Diários ===");
    lines.push("Data,Visualizações");
    dailyPageviews.forEach((d) => lines.push(`${d.date},${d.views}`));
    lines.push("");
    lines.push("=== Origens de Tráfego ===");
    lines.push("Source,Campaign,Medium,Referrer");
    trafficData.forEach((t) => lines.push(`${t.utm_source || ""},${t.utm_campaign || ""},${t.utm_medium || ""},${t.referrer || ""}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ellite-report-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
      <Download className="w-3.5 h-3.5 mr-1.5" />
      Exportar CSV
    </Button>
  );
};

export default ExportButton;
