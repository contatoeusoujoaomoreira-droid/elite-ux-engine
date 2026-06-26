import { useMemo, useState } from "react";
import { Stage, Lead } from "@/hooks/useCRM";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Clock, Target, Repeat, Zap, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type Range = "today" | "yesterday" | "week" | "month" | "all" | "custom";

interface Props {
  stages: Stage[];
  leads: Lead[];
  pipelineId: string;
}

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const CRMDashboard = ({ stages, leads, pipelineId }: Props) => {
  const [range, setRange] = useState<Range>("month");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd, setCustomEnd] = useState<Date | undefined>();

  const { start, end } = useMemo(() => {
    const now = new Date();
    if (range === "today") return { start: startOfDay(now), end: endOfDay(now) };
    if (range === "yesterday") { const y = new Date(now); y.setDate(y.getDate() - 1); return { start: startOfDay(y), end: endOfDay(y) }; }
    if (range === "week") { const s = new Date(now); s.setDate(s.getDate() - s.getDay()); return { start: startOfDay(s), end: endOfDay(now) }; }
    if (range === "month") { const s = new Date(now); s.setDate(s.getDate() - 30); return { start: startOfDay(s), end: endOfDay(now) }; }
    if (range === "custom" && customStart && customEnd) return { start: startOfDay(customStart), end: endOfDay(customEnd) };
    return { start: null as Date | null, end: null as Date | null };
  }, [range, customStart, customEnd]);

  const filteredLeads = useMemo(() => {
    if (!start || !end) return leads;
    return leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [leads, start, end]);

  const metrics = useMemo(() => {
    const wonStages = stages.filter(s => s.status_type === "won").map(s => s.id);
    const lostStages = stages.filter(s => s.status_type === "lost").map(s => s.id);
    const openStages = stages.filter(s => s.status_type === "open").map(s => s.id);

    const wonLeads = filteredLeads.filter(l => wonStages.includes(l.stage_id));
    const lostLeads = filteredLeads.filter(l => lostStages.includes(l.stage_id));
    const openLeads = filteredLeads.filter(l => openStages.includes(l.stage_id));

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
      count: filteredLeads.filter(l => l.stage_id === s.id).length,
      value: filteredLeads.filter(l => l.stage_id === s.id).reduce((acc, l) => acc + (l.opportunity_value || 0), 0),
      color: s.color || "#6366f1",
    }));

    // Source attribution breakdown (uses utm_source / source fallback)
    const sourceMap: Record<string, number> = {};
    filteredLeads.forEach((l: any) => {
      const src = l.utm_source || l.source || "direto";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sourceData = Object.entries(sourceMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { wonLeads, lostLeads, openLeads, winRate, projectedRevenue, realizedRevenue, mrrWon, onetimeWon, avgCycle, funnelData, totalClosed, sourceData };
  }, [stages, filteredLeads]);

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  const revenueBreakdown = [
    { name: "MRR", value: metrics.mrrWon, color: "#6366f1" },
    { name: "Único", value: metrics.onetimeWon, color: "#22c55e" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { id: "today", label: "Hoje" },
          { id: "yesterday", label: "Ontem" },
          { id: "week", label: "Semana" },
          { id: "month", label: "30 dias" },
          { id: "all", label: "Tudo" },
        ] as { id: Range; label: string }[]).map((r) => (
          <Button
            key={r.id}
            size="sm"
            variant={range === r.id ? "default" : "outline"}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </Button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant={range === "custom" ? "default" : "outline"} className="gap-1">
              <CalendarRange className="w-3.5 h-3.5" />
              {range === "custom" && customStart && customEnd
                ? `${customStart.toLocaleDateString("pt-BR")} – ${customEnd.toLocaleDateString("pt-BR")}`
                : "Personalizado"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col sm:flex-row gap-2">
              <Calendar mode="single" selected={customStart} onSelect={setCustomStart} />
              <Calendar mode="single" selected={customEnd} onSelect={(d) => { setCustomEnd(d); if (customStart && d) setRange("custom"); }} />
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-xs text-muted-foreground ml-auto">{filteredLeads.length} leads no período</span>
      </div>

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

      {/* Source attribution */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Origem dos Leads (Atribuição)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {metrics.sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="count" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados de origem ainda. Configure UTMs nas campanhas e formulários para começar a atribuir.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
