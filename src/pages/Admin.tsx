import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import KPICards from "@/components/admin/KPICards";
import PageviewsChart from "@/components/admin/PageviewsChart";
import TrafficTable from "@/components/admin/TrafficTable";
import ClickHeatmap from "@/components/admin/ClickHeatmap";
import PixelManager from "@/components/admin/PixelManager";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totalPageviews, setTotalPageviews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [planClicks, setPlanClicks] = useState<Record<string, number>>({});
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [totalPlanClicks, setTotalPlanClicks] = useState(0);
  const [dailyPageviews, setDailyPageviews] = useState<{ date: string; views: number }[]>([]);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAnalytics();
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    const { count: pvCount } = await supabase.from("pageviews").select("*", { count: "exact", head: true });
    setTotalPageviews(pvCount || 0);

    const { data: pvData } = await supabase.from("pageviews").select("session_id, created_at");
    const unique = new Set(pvData?.map(r => r.session_id).filter(Boolean));
    setUniqueVisitors(unique.size);

    const dailyMap: Record<string, number> = {};
    pvData?.forEach(r => {
      const day = r.created_at.substring(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const sorted = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, views]) => ({ date, views }));
    setDailyPageviews(sorted);

    const { data: clicks } = await supabase.from("plan_clicks").select("plan_name");
    const clickMap: Record<string, number> = {};
    let total = 0;
    clicks?.forEach(c => {
      clickMap[c.plan_name] = (clickMap[c.plan_name] || 0) + 1;
      total++;
    });
    setPlanClicks(clickMap);
    setTotalPlanClicks(total);

    const { data: traffic } = await supabase
      .from("pageviews")
      .select("utm_source, utm_campaign, referrer")
      .not("utm_source", "is", null)
      .limit(50);
    setTrafficData(traffic || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const conversionRate = totalPageviews > 0 ? ((totalPlanClicks / totalPageviews) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            <span className="text-gradient-gold">Ellite</span> Admin
          </h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-muted-foreground text-sm hover:text-primary transition">← Voltar ao Site</a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-destructive transition">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        <KPICards totalPageviews={totalPageviews} uniqueVisitors={uniqueVisitors} conversionRate={conversionRate} />
        <PageviewsChart dailyPageviews={dailyPageviews} />
        <TrafficTable trafficData={trafficData} />
        <ClickHeatmap planClicks={planClicks} />
        <PixelManager />
      </div>
    </div>
  );
};

export default AdminPage;
