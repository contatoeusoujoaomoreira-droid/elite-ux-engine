import { useState, useEffect } from "react";
import { Lock, BarChart3, Eye, MousePointerClick, Globe, Code, Save, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);

  // Scripts state
  const [metaPixel, setMetaPixel] = useState("");
  const [gtmScript, setGtmScript] = useState("");
  const [customHead, setCustomHead] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [saving, setSaving] = useState(false);

  // Analytics state
  const [totalPageviews, setTotalPageviews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [planClicks, setPlanClicks] = useState<Record<string, number>>({});
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [totalPlanClicks, setTotalPlanClicks] = useState(0);

  // Check session on mount
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAnalytics();
    loadScripts();
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    // Total pageviews
    const { count: pvCount } = await supabase.from("pageviews").select("*", { count: "exact", head: true });
    setTotalPageviews(pvCount || 0);

    // Unique visitors
    const { data: pvData } = await supabase.from("pageviews").select("session_id");
    const unique = new Set(pvData?.map(r => r.session_id).filter(Boolean));
    setUniqueVisitors(unique.size);

    // Plan clicks
    const { data: clicks } = await supabase.from("plan_clicks").select("plan_name");
    const clickMap: Record<string, number> = {};
    let total = 0;
    clicks?.forEach(c => {
      clickMap[c.plan_name] = (clickMap[c.plan_name] || 0) + 1;
      total++;
    });
    setPlanClicks(clickMap);
    setTotalPlanClicks(total);

    // Traffic data (UTMs)
    const { data: traffic } = await supabase
      .from("pageviews")
      .select("utm_source, utm_campaign, referrer")
      .not("utm_source", "is", null)
      .limit(50);
    setTrafficData(traffic || []);
  };

  const loadScripts = async () => {
    const { data } = await supabase.from("admin_scripts").select("*");
    data?.forEach(row => {
      switch (row.script_key) {
        case "meta_pixel": setMetaPixel(row.script_value); break;
        case "gtm_script": setGtmScript(row.script_value); break;
        case "custom_head": setCustomHead(row.script_value); break;
        case "custom_body": setCustomBody(row.script_value); break;
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Credenciais inválidas");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleSaveScripts = async () => {
    setSaving(true);
    const updates = [
      { script_key: "meta_pixel", script_value: metaPixel },
      { script_key: "gtm_script", script_value: gtmScript },
      { script_key: "custom_head", script_value: customHead },
      { script_key: "custom_body", script_value: customBody },
    ];
    for (const u of updates) {
      await supabase.from("admin_scripts").update({ script_value: u.script_value, updated_at: new Date().toISOString() }).eq("script_key", u.script_key);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm mb-3 focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm mb-4 focus:outline-none focus:border-primary"
          />
          {loginError && <p className="text-destructive text-xs mb-3">{loginError}</p>}
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

  const conversionRate = totalPageviews > 0 ? ((totalPlanClicks / totalPageviews) * 100).toFixed(1) : "0";

  const kpiCards = [
    { icon: Eye, label: "Pageviews Totais", value: totalPageviews.toLocaleString(), sub: "Todas as visitas" },
    { icon: Globe, label: "Visitantes Únicos", value: uniqueVisitors.toLocaleString(), sub: "Sessões únicas" },
    { icon: MousePointerClick, label: "Taxa de Conversão", value: `${conversionRate}%`, sub: "Cliques WhatsApp / Visitas" },
  ];

  const maxClicks = Math.max(...Object.values(planClicks), 1);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            <span className="text-gradient-gold">Ellite</span> Admin
          </h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-muted-foreground text-sm hover:text-primary transition">
              ← Voltar ao Site
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-destructive transition">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
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
                </tr>
              </thead>
              <tbody>
                {trafficData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground">
                      Nenhum dado de UTM capturado ainda
                    </td>
                  </tr>
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

        {/* Click Heatmap */}
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
            <button
              onClick={handleSaveScripts}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Scripts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
