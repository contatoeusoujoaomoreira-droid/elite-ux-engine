import { useState, useEffect } from "react";
import { Activity, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EventTrackingStatus = () => {
  const [trackingStatus, setTrackingStatus] = useState({
    metaPixel: false,
    googleAnalytics: false,
    googleTagManager: false,
    customEvents: false,
  });

  useEffect(() => {
    // Check if tracking scripts are loaded
    const checkTracking = () => {
      setTrackingStatus({
        metaPixel: !!(window as any).fbq,
        googleAnalytics: !!(window as any).gtag,
        googleTagManager: !!(window as any).dataLayer,
        customEvents: typeof (window as any).forwardEvent === "function",
      });
    };

    // Initial check
    checkTracking();

    // Check again after a delay (scripts might load asynchronously)
    const timer = setTimeout(checkTracking, 2000);

    window.addEventListener("scripts-ready", checkTracking);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scripts-ready", checkTracking);
    };
  }, []);

  const StatusItem = ({
    label,
    isActive,
  }: {
    label: string;
    isActive: boolean;
  }) => (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2">
        {isActive ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-400" />
        )}
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
        {isActive ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  );

  const allActive = Object.values(trackingStatus).every(Boolean);

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold text-foreground">Status de Rastreamento</h2>
        {allActive && (
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            Todos os rastreadores ativos
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <StatusItem label="Meta Pixel (Facebook)" isActive={trackingStatus.metaPixel} />
        <StatusItem label="Google Analytics" isActive={trackingStatus.googleAnalytics} />
        <StatusItem label="Google Tag Manager" isActive={trackingStatus.googleTagManager} />
        <StatusItem label="Event Forwarding" isActive={trackingStatus.customEvents} />
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <Activity className="w-3 h-3 inline mr-1" />
          Os eventos de página e cliques nos planos são automaticamente encaminhados para as plataformas configuradas.
        </p>
      </div>
    </div>
  );
};

export default EventTrackingStatus;
