import { useState } from "react";
import { Lock, BarChart3, Eye, MousePointerClick, Globe, Code, Save } from "lucide-react";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [metaPixel, setMetaPixel] = useState("");
  const [gtmScript, setGtmScript] = useState("");
  const [customHead, setCustomHead] = useState("");
  const [customBody, setCustomBody] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ellite2024") {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-center mb-6 text-foreground">
            Painel <span className="text-gradient-gold">Admin</span>
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm mb-4 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const kpiCards = [
    { icon: Eye, label: "Pageviews Totais", value: "—", sub: "Conectar Supabase" },
    { icon: Globe, label: "Visitantes Únicos", value: "—", sub: "Conectar Supabase" },
    { icon: MousePointerClick, label: "Taxa de Conversão", value: "—", sub: "Cliques WhatsApp / Visitas" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            <span className="text-gradient-gold">Ellite</span> Admin
          </h1>
          <a href="/" className="text-muted-foreground text-sm hover:text-primary transition">
            ← Voltar ao Site
          </a>
        </div>

        {/* KPI Cards */}
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

        {/* Traffic Table */}
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
                  <th className="text-right py-3 text-muted-foreground font-medium">Visitas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Conecte o Supabase para ver os dados de tráfego
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Click Heatmap */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-foreground">Heatmap de Cliques por Plano</h2>
          </div>
          <div className="space-y-3">
            {["Hora", "Diária", "Mensal"].map((plan) => (
              <div key={plan} className="flex items-center gap-4">
                <span className="text-foreground text-sm w-16">{plan}</span>
                <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                  <div className="h-full bg-primary/30 rounded-full" style={{ width: "0%" }} />
                </div>
                <span className="text-muted-foreground text-sm w-8 text-right">0</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs mt-4">Conecte o Supabase para dados reais</p>
        </div>

        {/* Pixel Management */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-foreground">Gestão de Pixels & Scripts</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Meta Pixel (Facebook)</label>
              <textarea
                value={metaPixel}
                onChange={(e) => setMetaPixel(e.target.value)}
                placeholder="Cole o script do Meta Pixel aqui..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Google Tag Manager</label>
              <textarea
                value={gtmScript}
                onChange={(e) => setGtmScript(e.target.value)}
                placeholder="Cole o script do GTM aqui..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Scripts Customizados (Head)</label>
              <textarea
                value={customHead}
                onChange={(e) => setCustomHead(e.target.value)}
                placeholder="Scripts para injetar no <head>..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Scripts Customizados (Body)</label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Scripts para injetar no <body>..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition">
              <Save className="w-4 h-4" />
              Salvar Scripts
            </button>
            <p className="text-muted-foreground text-xs">
              Os scripts serão persistidos quando o Supabase for conectado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
