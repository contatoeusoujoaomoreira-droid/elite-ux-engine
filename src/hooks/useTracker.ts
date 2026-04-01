import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { forwardEventToPixels } from "./useEventForwarder";

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

    console.log("[Tracker] Recording pageview in Supabase...");
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
      if (error) console.error("[Tracker] Pageview tracking error:", error);
    });

    // Forward PageView event
    const eventData = {
      eventName: "PageView",
      eventData: {
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer || null,
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
      },
    };

    // This will now be queued if scripts are not ready
    forwardEventToPixels(eventData);
  }, []);
}

export async function trackPlanClick(planName: string) {
  const sessionId = sessionStorage.getItem("ellite_sid") || "unknown";
  
  const { error } = await supabase.from("plan_clicks").insert({
    plan_name: planName,
    session_id: sessionId,
  });
  if (error) console.error("[Tracker] Plan click tracking error:", error);

  forwardEventToPixels({
    eventName: "Lead",
    eventData: {
      content_name: `Plan: ${planName}`,
      content_type: "product",
      content_id: planName,
      source: "plan_click",
    },
  });
}
