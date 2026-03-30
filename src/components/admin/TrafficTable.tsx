import { BarChart3 } from "lucide-react";

interface TrafficTableProps {
  trafficData: any[];
}

const TrafficTable = ({ trafficData }: TrafficTableProps) => (
  <div className="glass-card rounded-2xl p-6 mb-8">
    <div className="flex items-center gap-2 mb-4">
      <BarChart3 className="w-5 h-5 text-primary" />
      <h2 className="font-serif text-lg font-bold text-foreground">Rastreio de Tráfego</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 text-muted-foreground font-medium">UTM Source</th>
            <th className="text-left py-3 text-muted-foreground font-medium">UTM Campaign</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Referrer</th>
          </tr>
        </thead>
        <tbody>
          {trafficData.length === 0 ? (
            <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum dado de UTM capturado ainda</td></tr>
          ) : (
            trafficData.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 text-foreground">{row.utm_source || "—"}</td>
                <td className="py-2 text-foreground">{row.utm_campaign || "—"}</td>
                <td className="py-2 text-foreground truncate max-w-[200px]">{row.referrer || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default TrafficTable;
