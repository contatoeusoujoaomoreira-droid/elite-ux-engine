import { FormRecord, useFormSubmissions, useFormFields } from "@/hooks/useForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  form: FormRecord;
  onBack: () => void;
}

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e", "#3b82f6"];

const FormAnalytics = ({ form, onBack }: Props) => {
  const { submissions, loading } = useFormSubmissions(form.id);
  const { fields } = useFormFields(form.id);

  const completed = submissions.filter((s) => s.completed_at);
  const abandoned = submissions.filter((s) => !s.completed_at && s.dropped_at_field);
  const conversionRate = submissions.length > 0 ? ((completed.length / submissions.length) * 100).toFixed(1) : "0";

  // Average completion time
  const completionTimes = completed
    .filter((s) => s.started_at && s.completed_at)
    .map((s) => (new Date(s.completed_at!).getTime() - new Date(s.started_at!).getTime()) / 1000);
  const avgTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : 0;

  // Abandonment by field
  const dropOffMap: Record<string, number> = {};
  abandoned.forEach((s) => {
    if (s.dropped_at_field) {
      dropOffMap[s.dropped_at_field] = (dropOffMap[s.dropped_at_field] || 0) + 1;
    }
  });
  const dropOffData = Object.entries(dropOffMap)
    .map(([fieldId, count]) => {
      const field = fields.find((f) => f.id === fieldId);
      return { name: field?.label || fieldId.slice(0, 8), count };
    })
    .sort((a, b) => b.count - a.count);

  // UTM sources
  const utmMap: Record<string, number> = {};
  submissions.forEach((s) => {
    const source = (s.metadata as any)?.utm_source || "Direto";
    utmMap[source] = (utmMap[source] || 0) + 1;
  });
  const utmData = Object.entries(utmMap).map(([name, value]) => ({ name, value }));

  // Submissions per day
  const dailyMap: Record<string, number> = {};
  submissions.forEach((s) => {
    const day = s.created_at.substring(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  if (loading) {
    return <div className="text-muted-foreground text-center py-12">Carregando analytics...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <h2 className="text-lg font-semibold">{form.title} — Analytics</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-muted-foreground">Total Respostas</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <XCircle className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa Conversão</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{avgTime}s</p>
            <p className="text-xs text-muted-foreground">Tempo Médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Respostas por Dia</CardTitle></CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <XAxis dataKey="date" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                  <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Origem (UTM)</CardTitle></CardHeader>
          <CardContent>
            {utmData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={utmData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {utmData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off */}
      {dropOffData.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader><CardTitle className="text-sm">Abandono por Campo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dropOffData} layout="vertical">
                <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormAnalytics;
