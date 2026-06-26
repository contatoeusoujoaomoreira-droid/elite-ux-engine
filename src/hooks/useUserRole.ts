import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "user";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) { setRoles([]); setLoading(false); }
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email ?? null);
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);
      if (mounted) {
        setRoles(((data as any[]) || []).map((r) => r.role as AppRole));
        setLoading(false);
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const isSuperAdmin = roles.includes("super_admin") || email === "jpm19990@gmail.com";
  const isAdmin = isSuperAdmin || roles.includes("admin");

  return { roles, loading, userId, email, isSuperAdmin, isAdmin };
}

export async function logAudit(action: string, entityType?: string, entityId?: string, metadata?: Record<string, any>) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("audit_logs" as any).insert({
      actor_id: session.user.id,
      actor_email: session.user.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
    });
  } catch (e) {
    // silent
  }
}
