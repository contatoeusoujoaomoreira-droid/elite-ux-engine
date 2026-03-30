import { useState, useEffect } from "react";
import { Code, Save, CheckCircle2, XCircle, AlertTriangle, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PixelMode = "id" | "code";

interface PixelConfig {
  mode: PixelMode;
  pixelId: string;
  fullCode: string;
}

const PixelManager = () => {
  const [metaPixel, setMetaPixel] = useState<PixelConfig>({ mode: "id", pixelId: "", fullCode: "" });
  const [googleTag, setGoogleTag] = useState<PixelConfig>({ mode: "id", pixelId: "", fullCode: "" });
  const [customHead, setCustomHead] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Test states
  const [metaTestStatus, setMetaTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [googleTestStatus, setGoogleTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [metaTestMsg, setMetaTestMsg] = useState("");
  const [googleTestMsg, setGoogleTestMsg] = useState("");

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    const { data } = await supabase.from("admin_scripts").select("*");
    data?.forEach((row) => {
      const val = row.script_value || "";
      switch (row.script_key) {
        case "meta_pixel": {
          const idMatch = val.match(/fbq\(['"]init['"],\s*['"](\d+)['"]\)/);
          if (idMatch && !val.includes("<!--")) {
            setMetaPixel({ mode: "id", pixelId: idMatch[1], fullCode: val });
          } else if (val.trim()) {
            setMetaPixel({ mode: "code", pixelId: "", fullCode: val });
          }
          break;
        }
        case "gtm_script": {
          const gtmMatch = val.match(/GTM-[A-Z0-9]+|G-[A-Z0-9]+|AW-[A-Z0-9]+|UA-\d+-\d+/);
          if (gtmMatch && !val.includes("<!--")) {
            setGoogleTag({ mode: "id", pixelId: gtmMatch[0], fullCode: val });
          } else if (val.trim()) {
            setGoogleTag({ mode: "code", pixelId: "", fullCode: val });
          }
          break;
        }
        case "custom_head": setCustomHead(val); break;
        case "custom_body": setCustomBody(val); break;
      }
    });
  };

  const generateMetaPixelCode = (id: string) => `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/></noscript>`;

  const generateGoogleTagCode = (id: string) => {
    if (id.startsWith("GTM-")) {
      return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');</script>`;
    }
    return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
</script>`;
  };

  const getMetaValue = () => {
    if (metaPixel.mode === "id" && metaPixel.pixelId.trim()) return generateMetaPixelCode(metaPixel.pixelId.trim());
    if (metaPixel.mode === "code") return metaPixel.fullCode;
    return "";
  };

  const getGoogleValue = () => {
    if (googleTag.mode === "id" && googleTag.pixelId.trim()) return generateGoogleTagCode(googleTag.pixelId.trim());
    if (googleTag.mode === "code") return googleTag.fullCode;
    return "";
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const updates = [
      { script_key: "meta_pixel", script_value: getMetaValue() },
      { script_key: "gtm_script", script_value: getGoogleValue() },
      { script_key: "custom_head", script_value: customHead },
      { script_key: "custom_body", script_value: customBody },
    ];
    for (const u of updates) {
      await supabase.from("admin_scripts").update({ script_value: u.script_value, updated_at: new Date().toISOString() }).eq("script_key", u.script_key);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testMetaPixel = async () => {
    setMetaTestStatus("testing");
    setMetaTestMsg("");
    const value = getMetaValue();
    if (!value.trim()) {
      setMetaTestStatus("error");
      setMetaTestMsg("Nenhum pixel configurado. Insira o ID ou código.");
      return;
    }
    const hasInit = /fbq\(['"]init['"],\s*['"](\d+)['"]\)/.test(value);
    const hasPageView = /fbq\(['"]track['"],\s*['"]PageView['"]\)/.test(value);
    const hasScript = /connect\.facebook\.net/.test(value);
    if (hasInit && hasPageView && hasScript) {
      const idMatch = value.match(/fbq\(['"]init['"],\s*['"](\d+)['"]\)/);
      setMetaTestStatus("success");
      setMetaTestMsg(`✅ Pixel válido! ID: ${idMatch?.[1]}. Contém init, PageView e script SDK.`);
    } else {
      const issues: string[] = [];
      if (!hasInit) issues.push("fbq('init') ausente");
      if (!hasPageView) issues.push("fbq('track', 'PageView') ausente");
      if (!hasScript) issues.push("SDK do Facebook ausente");
      setMetaTestStatus("error");
      setMetaTestMsg(`⚠️ Problemas: ${issues.join(", ")}`);
    }
  };

  const testGoogleTag = async () => {
    setGoogleTestStatus("testing");
    setGoogleTestMsg("");
    const value = getGoogleValue();
    if (!value.trim()) {
      setGoogleTestStatus("error");
      setGoogleTestMsg("Nenhuma tag configurada. Insira o ID ou código.");
      return;
    }
    const isGTM = /GTM-[A-Z0-9]+/.test(value);
    const isGA4 = /G-[A-Z0-9]+/.test(value);
    const isAds = /AW-[A-Z0-9]+/.test(value);
    const hasGtmScript = /googletagmanager\.com\/gtm\.js/.test(value);
    const hasGtagScript = /googletagmanager\.com\/gtag\/js/.test(value);

    if (isGTM && hasGtmScript) {
      const id = value.match(/GTM-[A-Z0-9]+/)?.[0];
      setGoogleTestStatus("success");
      setGoogleTestMsg(`✅ GTM válido! Container: ${id}. Script de carregamento detectado.`);
    } else if ((isGA4 || isAds) && hasGtagScript) {
      const id = value.match(/G-[A-Z0-9]+|AW-[A-Z0-9]+/)?.[0];
      setGoogleTestStatus("success");
      setGoogleTestMsg(`✅ Google Tag válida! ID: ${id}. gtag.js detectado.`);
    } else {
      const issues: string[] = [];
      if (!isGTM && !isGA4 && !isAds) issues.push("ID do Google não encontrado (GTM-xxx, G-xxx ou AW-xxx)");
      if (!hasGtmScript && !hasGtagScript) issues.push("Script de carregamento ausente");
      setGoogleTestStatus("error");
      setGoogleTestMsg(`⚠️ Problemas: ${issues.join(", ")}`);
    }
  };

  const TestBadge = ({ status, msg }: { status: string; msg: string }) => {
    if (status === "idle") return null;
    return (
      <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-xs ${
        status === "testing" ? "bg-primary/10 text-primary" :
        status === "success" ? "bg-green-500/10 text-green-400" :
        "bg-destructive/10 text-destructive"
      }`}>
        {status === "testing" && <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
        {status === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
        {status === "error" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
        <span>{status === "testing" ? "Validando..." : msg}</span>
      </div>
    );
  };

  const ModeToggle = ({ mode, onToggle }: { mode: PixelMode; onToggle: () => void }) => (
    <button onClick={onToggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition px-2 py-1 rounded-md bg-secondary/50">
      {mode === "id" ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
      {mode === "id" ? "Modo ID" : "Código Completo"}
    </button>
  );

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Code className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold text-foreground">Gestão de Pixels & Scripts</h2>
      </div>
      <div className="space-y-8">
        {/* META PIXEL */}
        <div className="border border-border/50 rounded-xl p-5 bg-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-sm">f</span>
              </div>
              <div>
                <h3 className="text-foreground text-sm font-semibold">Meta Pixel (Facebook)</h3>
                <p className="text-muted-foreground text-xs">Rastreie conversões e crie públicos</p>
              </div>
            </div>
            <ModeToggle mode={metaPixel.mode} onToggle={() => setMetaPixel(p => ({ ...p, mode: p.mode === "id" ? "code" : "id" }))} />
          </div>

          {metaPixel.mode === "id" ? (
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">ID do Pixel (apenas números)</label>
              <input
                value={metaPixel.pixelId}
                onChange={(e) => setMetaPixel(p => ({ ...p, pixelId: e.target.value.replace(/\D/g, "") }))}
                placeholder="Ex: 123456789012345"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm font-mono focus:outline-none focus:border-primary"
              />
              {metaPixel.pixelId && (
                <p className="text-muted-foreground text-xs mt-2">
                  Eventos rastreados automaticamente: <span className="text-primary">PageView</span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">Código completo do pixel</label>
              <textarea
                value={metaPixel.fullCode}
                onChange={(e) => setMetaPixel(p => ({ ...p, fullCode: e.target.value }))}
                placeholder="Cole o código completo do Meta Pixel aqui..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-32 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button onClick={testMetaPixel} className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-md hover:bg-blue-500/30 transition font-medium">
              🔍 Testar Pixel
            </button>
          </div>
          <TestBadge status={metaTestStatus} msg={metaTestMsg} />
        </div>

        {/* GOOGLE TAG */}
        <div className="border border-border/50 rounded-xl p-5 bg-secondary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-sm">G</span>
              </div>
              <div>
                <h3 className="text-foreground text-sm font-semibold">Google Tag (GTM / GA4 / Ads)</h3>
                <p className="text-muted-foreground text-xs">Tag Manager, Analytics ou Google Ads</p>
              </div>
            </div>
            <ModeToggle mode={googleTag.mode} onToggle={() => setGoogleTag(p => ({ ...p, mode: p.mode === "id" ? "code" : "id" }))} />
          </div>

          {googleTag.mode === "id" ? (
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">ID da Tag (GTM-xxx, G-xxx ou AW-xxx)</label>
              <input
                value={googleTag.pixelId}
                onChange={(e) => setGoogleTag(p => ({ ...p, pixelId: e.target.value.toUpperCase() }))}
                placeholder="Ex: GTM-XXXXXXX ou G-XXXXXXXXXX"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm font-mono focus:outline-none focus:border-primary"
              />
              {googleTag.pixelId && (
                <p className="text-muted-foreground text-xs mt-2">
                  Tipo detectado: <span className="text-primary">
                    {googleTag.pixelId.startsWith("GTM-") ? "Tag Manager" : googleTag.pixelId.startsWith("G-") ? "GA4" : googleTag.pixelId.startsWith("AW-") ? "Google Ads" : "Desconhecido"}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">Código completo da tag</label>
              <textarea
                value={googleTag.fullCode}
                onChange={(e) => setGoogleTag(p => ({ ...p, fullCode: e.target.value }))}
                placeholder="Cole o código completo do GTM / GA4 / Ads aqui..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-32 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button onClick={testGoogleTag} className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-md hover:bg-yellow-500/30 transition font-medium">
              🔍 Testar Tag
            </button>
          </div>
          <TestBadge status={googleTestStatus} msg={googleTestMsg} />
        </div>

        {/* Custom Scripts */}
        <div className="border border-border/50 rounded-xl p-5 bg-secondary/20">
          <h3 className="text-foreground text-sm font-semibold mb-4">Scripts Customizados</h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">Injetar no {"<head>"}</label>
              <textarea
                value={customHead}
                onChange={(e) => setCustomHead(e.target.value)}
                placeholder="Scripts para injetar no <head>..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs mb-1.5 block">Injetar no {"<body>"}</label>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Scripts para injetar no <body>..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-xs font-mono h-24 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Tudo"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelManager;
