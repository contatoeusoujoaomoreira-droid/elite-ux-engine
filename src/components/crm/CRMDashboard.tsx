import { useMemo } from "react";
import { Stage, Lead } from "@/hooks/useCRM";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Clock, Target, Repeat, Zap } from "lucide-react";

interface Props {
  stages: Stage[];
  leads: Lead[];
  pipelineId: string;
}

const CRMDashboard = ({ stages, leads, pipelineId }: Props) => {
  const metrics = useMemo(() => {
    const wonStages = stages.filter(s => s.status_type === "won").map(s => s.id);
    const lostStages = stages.filter(s => s.status_type === "lost").map(s => s.id);
    const openStages = stages.filter(s => s.status_type === "open").map(s => s.id);

    const wonLeads = leads.filter(l => wonStages.includes(l.stage_id));
    const lostLeads = leads.filter(l => lostStages.includes(l.stage_id));
    const openLeads = leads.filter(l => openStages.includes(l.stage_id));

    const totalClosed = wonLeads.length + lostLeads.length;
    const winRate = totalClosed > 0 ? (wonLeads.length / totalClosed * 100) : 0;

    const projectedRevenue = openLeads.reduce((acc, l) => acc + (l.opportunity_value || 0), 0);
    const realizedRevenue = wonLeads.reduce((acc, l) => acc + (l.opportunity_value || 0), 0);

    const mrrWon = wonLeads.filter(l => l.billing_type === "recurring").reduce((acc, l) => acc + (l.opportunity_value || 0), 0);
    const onetimeWon = wonLeads.filter(l => l.billing_type !== "recurring").reduce((acc, l) => acc + (l.opportunity_value || 0), 0);

    // Sales cycle: avg days from created_at to last_stage_change_at for won leads
    const cycles = wonLeads.map(l => (new Date(l.last_stage_change_at).getTime() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const avgCycle = cycles.length > 0 ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : 0;

    // Per-stage funnel data
    const funnelData = stages.map(s => ({
      name: s.name,
      count: leads.filter(l => l.stage_id === s.id).length,
      value: leads.filter(l => l.stage_id === s.id).reduce((acc, l) => acc + (l.opportunity_value || 0), 0),
      color: s.color || "#6366f1",
    }));

    return { wonLeads, lostLeads, openLeads, winRate, projectedRevenue, realizedRevenue, mrrWon, onetimeWon, avgCycle, funnelData, totalClosed };
  }, [stages, leads]);

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  const revenueBreakdown = [
    { name: "MRR", value: metrics.mrrWon, color: "#6366f1" },
    { name: "Único", value: metrics.onetimeWon, color: "#22c55e" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard icon={Target} label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} sub={`${metrics.wonLeads.length} ganhos`} color="text-green-500" />
        <KPICard icon={DollarSign} label="Receita Realizada" value={fmt(metrics.realizedRevenue)} sub={`${metrics.wonLeads.length} fechados`} color="text-primary" />
        <KPICard icon={TrendingUp} label="Pipeline Projetado" value={fmt(metrics.projectedRevenue)} sub={`${metrics.openLeads.length} abertos`} color="text-blue-500" />
        <KPICard icon={Repeat} label="MRR Ganho" value={fmt(metrics.mrrWon)} sub="Recorrente" color="text-purple-500" />
        <KPICard icon={Zap} label="Receita Única" value={fmt(metrics.onetimeWon)} sub="Pontual" color="text-amber-500" />
        <KPICard icon={Clock} label="Ciclo de Vendas" value={`${metrics.avgCycle} dias`} sub="Média" color="text-orange-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel chart */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funil por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.funnelData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={75} />
                  <Tooltip formatter={(v: number) => [v, "Leads"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {metrics.funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue breakdown */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita: MRR vs. Única</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center justify-center">
              {revenueBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${fmt(value)}`}>
                      {revenueBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma receita registrada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) => (
  <Card className="bg-card border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </CardContent>
  </Card>
);

export default CRMDashboard;
