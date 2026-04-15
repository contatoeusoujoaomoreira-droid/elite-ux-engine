import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import DateRangeFilter, { DateRangeType } from "@/components/admin/DateRangeFilter";
import AnalyticsOverview from "@/components/admin/AnalyticsOverview";
import PageviewsChart from "@/components/admin/PageviewsChart";
import ConversionFunnel from "@/components/admin/ConversionFunnel";
import PlanPerformanceChart from "@/components/admin/PlanPerformanceChart";
import UTMSourceTable from "@/components/admin/UTMSourceTable";
import PixelHealthMonitor from "@/components/admin/PixelHealthMonitor";
import PixelManager from "@/components/admin/PixelManager";
import UserManagement from "@/components/admin/UserManagement";
import ExportButton from "@/components/admin/ExportButton";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("month");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());

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

    const pageviewSub = supabase
      .channel("pageviews-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pageviews" }, () => loadAnalytics())
      .subscribe();

    const clickSub = supabase
      .channel("clicks-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "plan_clicks" }, () => loadAnalytics())
      .subscribe();

    return () => {
      supabase.removeChannel(pageviewSub);
      supabase.removeChannel(clickSub);
    };
  }, [isAuthenticated, startDate, endDate]);

  const loadAnalytics = async () => {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const { count: pvCount } = await supabase
      .from("pageviews")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startISO)
      .lte("created_at", endISO);
    setTotalPageviews(pvCount || 0);

    const { data: pvData } = await supabase
      .from("pageviews")
      .select("session_id, created_at, utm_source, utm_campaign, utm_medium, referrer")
      .gte("created_at", startISO)
      .lte("created_at", endISO);
    const unique = new Set(pvData?.map((r) => r.session_id).filter(Boolean));
    setUniqueVisitors(unique.size);

    const dailyMap: Record<string, number> = {};
    pvData?.forEach((r) => {
      const day = r.created_at.substring(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    setDailyPageviews(
      Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, views]) => ({ date, views }))
    );

    const { data: clicks } = await supabase
      .from("plan_clicks")
      .select("plan_name")
      .gte("created_at", startISO)
      .lte("created_at", endISO);
    const clickMap: Record<string, number> = {};
    let total = 0;
    clicks?.forEach((c) => {
      clickMap[c.plan_name] = (clickMap[c.plan_name] || 0) + 1;
      total++;
    });
    setPlanClicks(clickMap);
    setTotalPlanClicks(total);

    setTrafficData(pvData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleDateRangeChange = (type: DateRangeType, start: Date, end: Date) => {
    setDateRangeType(type);
    setStartDate(start);
    setEndDate(end);
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center gap-4 border-b border-border/50 px-4 md:px-6 shrink-0">
            <SidebarTrigger>
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold text-foreground">
                <span className="text-primary">Ellite</span> Admin
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <a href="/" className="text-muted-foreground text-xs hover:text-primary transition">← Voltar ao Site</a>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === "dashboard" && (
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <DateRangeFilter onRangeChange={handleDateRangeChange} />
                  <ExportButton
                    totalPageviews={totalPageviews}
                    uniqueVisitors={uniqueVisitors}
                    conversionRate={conversionRate}
                    planClicks={planClicks}
                    trafficData={trafficData}
                    dailyPageviews={dailyPageviews}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>

                <AnalyticsOverview
                  totalPageviews={totalPageviews}
                  uniqueVisitors={uniqueVisitors}
                  conversionRate={conversionRate}
                  trafficData={trafficData}
                />

                <div className="grid lg:grid-cols-2 gap-6">
                  <ConversionFunnel
                    pageviews={totalPageviews}
                    planClicks={totalPlanClicks}
                    waIntents={totalPlanClicks}
                  />
                  <PlanPerformanceChart planClicks={planClicks} />
                </div>

                <PageviewsChart dailyPageviews={dailyPageviews} />
                <UTMSourceTable trafficData={trafficData} />
              </div>
            )}

            {activeTab === "pixel-health" && (
              <div className="max-w-4xl mx-auto">
                <PixelHealthMonitor />
              </div>
            )}

            {activeTab === "crm" && (
              <div className="w-full">
                <CRMModule />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <PixelManager />
                <UserManagement />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
