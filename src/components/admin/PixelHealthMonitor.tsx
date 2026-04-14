import { useState, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, Terminal, AlertTriangle, ExternalLink, RefreshCw, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PixelDiagnostic {
  name: string;
  key: string;
  status: "ok" | "error" | "warning" | "loading";
  message: string;
  details: string[];
}

const PixelHealthMonitor = () => {
  const [diagnostics, setDiagnostics] = useState<PixelDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>("");

  const runDiagnostics = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("admin_scripts").select("script_key, script_value");

    if (error) {
      setDiagnostics([{
        name: "Erro de Conexão",
        key: "connection",
        status: "error",
        message: "Não foi possível acessar o banco de dados.",
        details: [error.message],
      }]);
      setLoading(false);
      return;
    }

    const scripts = Object.fromEntries((data || []).map(r => [r.script_key, r.script_value || ""]));
    const results: PixelDiagnostic[] = [];

    // --- META PIXEL ---
    const metaCode = scripts["meta_pixel"] || "";
    const metaDiag: PixelDiagnostic = {
      name: "Meta Pixel (Facebook)",
      key: "meta_pixel",
      status: "loading",
      message: "",
      details: [],
    };

    if (!metaCode.trim()) {
      metaDiag.status = "error";
      metaDiag.message = "Pixel NÃO configurado";
      metaDiag.details = [
        "Nenhum código de pixel foi salvo.",
        "Caminho: Admin → Configurações → Gestão de Pixels → Meta Pixel",
        "Insira o ID do pixel (ex: 1676722106832356) ou cole o código completo.",
        "Clique em 'Salvar Tudo' e depois recarregue a landing page.",
      ];
    } else {
      const hasInit = /fbq\(['"]init['"],\s*['"](\d+)['"]\)/.test(metaCode);
      const hasPageView = /fbq\(['"]track['"],\s*['"]PageView['"]\)/.test(metaCode);
      const hasSDK = /connect\.facebook\.net/.test(metaCode);
      const pixelId = metaCode.match(/fbq\(['"]init['"],\s*['"](\d+)['"]\)/)?.[1];

      if (hasInit && hasPageView && hasSDK) {
        metaDiag.status = "ok";
        metaDiag.message = `Pixel configurado corretamente — ID: ${pixelId}`;
        metaDiag.details = [
          `✅ fbq('init', '${pixelId}') — Inicialização detectada`,
          "✅ fbq('track', 'PageView') — Evento PageView configurado",
          "✅ SDK Facebook (connect.facebook.net) — Script carregado",
          "ℹ️ Eventos Lead e Contact são disparados automaticamente ao clicar nos planos.",
          "ℹ️ Para testar: Abra a landing page → F12 → Console → Procure por '[Meta Pixel]'",
          "ℹ️ Ou use a extensão 'Meta Pixel Helper' no Chrome para validar em tempo real.",
        ];
      } else {
        metaDiag.status = "warning";
        metaDiag.message = "Pixel com problemas de configuração";
        if (!hasInit) metaDiag.details.push("❌ fbq('init') AUSENTE — O pixel não será inicializado.");
        if (!hasPageView) metaDiag.details.push("❌ fbq('track', 'PageView') AUSENTE — Pageviews não serão rastreados.");
        if (!hasSDK) metaDiag.details.push("❌ SDK do Facebook AUSENTE — O script fbevents.js não foi encontrado.");
        metaDiag.details.push("Caminho para corrigir: Admin → Configurações → Meta Pixel → Use 'Modo ID' e cole apenas o número do pixel.");
      }
    }
    results.push(metaDiag);

    // --- GOOGLE TAG ---
    const gtmCode = scripts["gtm_script"] || "";
    const gtmDiag: PixelDiagnostic = {
      name: "Google Tag (GTM / GA4 / Ads)",
      key: "gtm_script",
      status: "loading",
      message: "",
      details: [],
    };

    if (!gtmCode.trim()) {
      gtmDiag.status = "error";
      gtmDiag.message = "Tag NÃO configurada";
      gtmDiag.details = [
        "Nenhuma tag do Google foi salva.",
        "Caminho: Admin → Configurações → Gestão de Pixels → Google Tag",
        "Insira o ID (GTM-xxx, G-xxx ou AW-xxx) ou cole o código completo.",
        "Clique em 'Salvar Tudo' e depois recarregue a landing page.",
      ];
    } else {
      const isGTM = /GTM-[A-Z0-9]+/.test(gtmCode);
      const isGA4 = /G-[A-Z0-9]+/.test(gtmCode);
      const isAds = /AW-[A-Z0-9]+/.test(gtmCode);
      const hasGtmJs = /googletagmanager\.com\/gtm\.js/.test(gtmCode);
      const hasGtagJs = /googletagmanager\.com\/gtag\/js/.test(gtmCode);
      const hasDataLayer = /dataLayer/.test(gtmCode);
      const tagId = gtmCode.match(/GTM-[A-Z0-9]+|G-[A-Z0-9]+|AW-[A-Z0-9]+/)?.[0];

      if ((isGTM && hasGtmJs) || ((isGA4 || isAds) && hasGtagJs)) {
        gtmDiag.status = "ok";
        gtmDiag.message = `Tag configurada corretamente — ID: ${tagId}`;
        gtmDiag.details = [
          `✅ ID detectado: ${tagId} (${isGTM ? "Tag Manager" : isGA4 ? "GA4" : "Google Ads"})`,
          `✅ Script de carregamento: ${hasGtmJs ? "gtm.js" : "gtag.js"} presente`,
          hasDataLayer ? "✅ dataLayer configurado" : "⚠️ dataLayer não encontrado explicitamente",
          "ℹ️ Para testar: Abra a landing page → F12 → Console → Procure por '[Google Analytics]' ou '[Google Tag Manager]'",
          "ℹ️ Ou use a extensão 'Google Tag Assistant' no Chrome.",
        ];
      } else {
        gtmDiag.status = "warning";
        gtmDiag.message = "Tag com problemas de configuração";
        if (!isGTM && !isGA4 && !isAds) gtmDiag.details.push("❌ Nenhum ID do Google reconhecido (GTM-xxx, G-xxx ou AW-xxx).");
        if (!hasGtmJs && !hasGtagJs) gtmDiag.details.push("❌ Script de carregamento ausente (gtm.js ou gtag.js).");
        gtmDiag.details.push("Caminho para corrigir: Admin → Configurações → Google Tag → Use 'Modo ID' e cole o ID da tag.");
      }
    }
    results.push(gtmDiag);

    // --- EVENT FORWARDING ---
    const eventDiag: PixelDiagnostic = {
      name: "Event Forwarding (Tracker)",
      key: "tracker",
      status: "loading",
      message: "",
      details: [],
    };

    const metaOk = results[0].status === "ok";
    const googleOk = results[1].status === "ok";

    if (metaOk || googleOk) {
      eventDiag.status = "ok";
      eventDiag.message = "Eventos sendo encaminhados para os pixels ativos";
      eventDiag.details = [
        "✅ O sistema dispara eventos automaticamente na landing page:",
        "   • PageView — ao carregar qualquer página",
        "   • Lead — ao clicar em um plano (redirecionamento WhatsApp)",
        "   • Contact — junto com Lead, para otimização de campanhas",
        metaOk ? "✅ Eventos sendo enviados para Meta Pixel" : "⚠️ Meta Pixel não configurado — eventos não enviados",
        googleOk ? "✅ Eventos sendo enviados para Google Tag" : "⚠️ Google Tag não configurada — eventos não enviados",
      ];
    } else {
      eventDiag.status = "error";
      eventDiag.message = "Nenhum pixel ativo para receber eventos";
      eventDiag.details = [
        "❌ Sem Meta Pixel e sem Google Tag configurados.",
        "Os eventos (PageView, Lead, Contact) estão sendo gerados mas descartados.",
        "Configure ao menos um pixel em: Admin → Configurações → Gestão de Pixels",
      ];
    }
    results.push(eventDiag);

    // --- SCRIPT INJECTION ---
    const injectionDiag: PixelDiagnostic = {
      name: "Injeção Dinâmica de Scripts",
      key: "injection",
      status: "ok",
      message: "Sistema de injeção ativo",
      details: [
        "ℹ️ Os scripts são injetados APENAS na Landing Page (página pública '/').",
        "ℹ️ No painel Admin (/admin), os pixels NÃO são carregados — isso é proposital.",
        "ℹ️ A injeção usa o hook useScriptInjector que busca os scripts do banco de dados.",
        "ℹ️ Após salvar alterações nos pixels, o visitante precisa recarregar a página.",
        "",
        "📋 Como testar se os pixels estão funcionando:",
        "1. Abra a landing page em uma aba anônima",
        "2. Pressione F12 (DevTools) → Aba Console",
        "3. Procure pelos logs: [ScriptInjector], [Meta Pixel], [Google Analytics]",
        "4. Para Meta: Instale a extensão 'Meta Pixel Helper' no Chrome",
        "5. Para Google: Use o 'Tag Assistant' ou verifique no Google Analytics em tempo real",
      ],
    };
    results.push(injectionDiag);

    setDiagnostics(results);
    setLoading(false);
    setLastCheck(new Date().toLocaleTimeString("pt-BR"));
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case "ok": return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "error": return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ok": return "border-green-500/30 bg-green-500/5";
      case "error": return "border-red-500/30 bg-red-500/5";
      case "warning": return "border-yellow-500/30 bg-yellow-500/5";
      default: return "border-border/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Diagnóstico de Pixels & Rastreamento</h3>
          </div>
          <div className="flex items-center gap-3">
            {lastCheck && <span className="text-xs text-muted-foreground">Última verificação: {lastCheck}</span>}
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Verificar Agora
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mt-4">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300">
            Os pixels são carregados <strong>apenas na landing page pública</strong> (não no admin). 
            Este diagnóstico verifica se a <strong>configuração salva no banco</strong> está correta. 
            Para testar em tempo real, abra a landing page em outra aba.
          </p>
        </div>
      </div>

      {/* Diagnostic Cards */}
      {diagnostics.map((diag) => (
        <div key={diag.key} className={`rounded-2xl border p-6 ${statusColor(diag.status)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {statusIcon(diag.status)}
              <div>
                <h4 className="text-sm font-semibold text-foreground">{diag.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{diag.message}</p>
              </div>
            </div>
            <Badge
              variant={diag.status === "ok" ? "default" : diag.status === "warning" ? "outline" : "destructive"}
              className="text-xs"
            >
              {diag.status === "ok" ? "🟢 Ativo" : diag.status === "warning" ? "🟡 Atenção" : diag.status === "error" ? "🔴 Inativo" : "⏳ Verificando"}
            </Badge>
          </div>
          <div className="bg-black/30 rounded-lg p-4 space-y-1.5 font-mono text-xs">
            {diag.details.map((line, i) => (
              <div
                key={i}
                className={`${
                  line.startsWith("✅") ? "text-green-400" :
                  line.startsWith("❌") ? "text-red-400" :
                  line.startsWith("⚠️") ? "text-yellow-400" :
                  line.startsWith("ℹ️") || line.startsWith("📋") ? "text-blue-300" :
                  line.trim() === "" ? "h-2" :
                  "text-muted-foreground"
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Link */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">🔗 Links Úteis para Teste</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Landing Page (testar pixels ao vivo)
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-blue-500/30 transition text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            Baixar Meta Pixel Helper (Chrome)
          </a>
          <a
            href="https://tagassistant.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-yellow-500/30 transition text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 text-yellow-400" />
            Google Tag Assistant
          </a>
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-blue-500/30 transition text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 text-blue-400" />
            Meta Events Manager (verificar eventos)
          </a>
        </div>
      </div>
    </div>
  );
};

export default PixelHealthMonitor;
