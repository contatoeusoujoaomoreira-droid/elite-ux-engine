import { useState, useEffect, useRef } from "react";
import { Activity, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventLogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

const PixelHealthMonitor = () => {
  const [status, setStatus] = useState({
    fbq: false,
    gtag: false,
    dataLayer: false,
  });
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    const check = () => {
      const w = window as any;
      setStatus({
        fbq: !!w.fbq,
        gtag: !!w.gtag,
        dataLayer: Array.isArray(w.dataLayer) && w.dataLayer.length > 0,
      });
    };

    check();
    intervalRef.current = window.setInterval(check, 3000);

    // Intercept console.log for event forwarding logs
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      const msg = args.join(" ");
      if (msg.includes("[Meta Pixel]") || msg.includes("[Google") || msg.includes("[EventForwarder]") || msg.includes("[Tracker]")) {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        const type = msg.includes("Error") || msg.includes("error") ? "error" : msg.includes("forwarded") || msg.includes("pushed") ? "success" : "info";
        setEventLog((prev) => [...prev.slice(-49), { time, message: msg, type }]);
      }
    };

    window.addEventListener("scripts-ready", check);

    return () => {
      clearInterval(intervalRef.current);
      console.log = originalLog;
      window.removeEventListener("scripts-ready", check);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [eventLog]);

  const StatusIndicator = ({ label, active }: { label: string; active: boolean }) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-3">
        {active ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <Badge variant={active ? "default" : "destructive"} className="text-xs">
        {active ? "🟢 Ativo" : "🔴 Inativo"}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Indicators */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Saúde dos Pixels</h3>
        </div>
        <div className="space-y-2">
          <StatusIndicator label="window.fbq (Meta Pixel)" active={status.fbq} />
          <StatusIndicator label="window.gtag (Google Tag)" active={status.gtag} />
          <StatusIndicator label="dataLayer (GTM Events)" active={status.dataLayer} />
        </div>
      </div>

      {/* Event Log Terminal */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Event Log (Tempo Real)</h3>
          <Badge variant="outline" className="ml-auto text-xs">{eventLog.length} eventos</Badge>
        </div>
        <div
          ref={logRef}
          className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs space-y-1 border border-border/30"
        >
          {eventLog.length === 0 ? (
            <span className="text-muted-foreground">Aguardando eventos... Navegue na página pública para gerar logs.</span>
          ) : (
            eventLog.map((entry, i) => (
              <div key={i} className={`${
                entry.type === "success" ? "text-green-400" :
                entry.type === "error" ? "text-red-400" :
                "text-blue-300"
              }`}>
                <span className="text-muted-foreground">[{entry.time}]</span> {entry.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PixelHealthMonitor;
