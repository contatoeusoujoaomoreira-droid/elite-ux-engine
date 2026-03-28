import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let sid = sessionStorage.getItem("ellite_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ellite_sid", sid);
  }
  return sid;
}

export function useTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const params = new URLSearchParams(window.location.search);
    const sessionId = getSessionId();

    supabase.from("pageviews").insert({
      session_id: sessionId,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
      utm_term: params.get("utm_term") || null,
      utm_content: params.get("utm_content") || null,
      user_agent: navigator.userAgent,
    }).then(({ error }) => {
      if (error) console.error("Pageview tracking error:", error);
    });
  }, []);
}

export async function trackPlanClick(planName: string) {
  const sessionId = sessionStorage.getItem("ellite_sid") || "unknown";
  const { error } = await supabase.from("plan_clicks").insert({
    plan_name: planName,
    session_id: sessionId,
  });
  if (error) console.error("Plan click tracking error:", error);
}
