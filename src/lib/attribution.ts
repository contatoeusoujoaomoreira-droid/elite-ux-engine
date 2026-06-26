// Centralized attribution capture (UTMs + referrer + landing page)
// Persists the FIRST-TOUCH attribution per browser session.

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
};

const STORAGE_KEY = "ellite_attribution_v1";

const readParams = (): Attribution => {
  if (typeof window === "undefined") {
    return {
      utm_source: null, utm_medium: null, utm_campaign: null,
      utm_term: null, utm_content: null, referrer: null, landing_page: null,
    };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source"),
    utm_medium: p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
    utm_term: p.get("utm_term"),
    utm_content: p.get("utm_content"),
    referrer: document.referrer || null,
    landing_page: window.location.pathname + window.location.search,
  };
};

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return readParams();
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {}
  const fresh = readParams();
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch {}
  return fresh;
}

export function getAttribution(): Attribution {
  return captureAttribution();
}
