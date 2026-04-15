import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Pipeline = Tables<"crm_pipelines">;
export type Stage = Tables<"crm_stages">;
export type Lead = Tables<"crm_leads"> & {
  tags?: Tag[];
  stage?: Stage;
  tasks_count?: number;
  pending_tasks?: number;
};
export type Tag = Tables<"crm_tags">;
export type Activity = Tables<"crm_activities">;
export type Task = Tables<"crm_tasks">;

export const STAGNATION_DAYS = 3;

export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("crm_pipelines").select("*").order("created_at");
    setPipelines(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (name: string, description?: string) => {
    const { data, error } = await supabase.from("crm_pipelines").insert({ name, description }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return null; }
    await load();
    return data;
  };

  const update = async (id: string, updates: Partial<Pipeline>) => {
    await supabase.from("crm_pipelines").update(updates).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("crm_pipelines").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: "Remova todos os leads antes de excluir o pipeline.", variant: "destructive" }); return; }
    await load();
  };

  return { pipelines, loading, create, update, remove, reload: load };
}

export function useStages(pipelineId: string | null) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pipelineId) { setStages([]); setLoading(false); return; }
    const { data } = await supabase.from("crm_stages").select("*").eq("pipeline_id", pipelineId).order("position");
    setStages(data || []);
    setLoading(false);
  }, [pipelineId]);

  useEffect(() => { load(); }, [load]);

  const create = async (name: string, statusType: string = "open", color: string = "#6366f1") => {
    if (!pipelineId) return;
    const maxPos = stages.length > 0 ? Math.max(...stages.map(s => s.position)) + 1 : 0;
    await supabase.from("crm_stages").insert({ pipeline_id: pipelineId, name, position: maxPos, status_type: statusType, color });
    await load();
  };

  const update = async (id: string, updates: Partial<Stage>) => {
    await supabase.from("crm_stages").update(updates).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("crm_stages").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: "Mova os leads desta etapa antes de excluí-la.", variant: "destructive" }); return; }
    await load();
  };

  const reorder = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, i) => supabase.from("crm_stages").update({ position: i }).eq("id", id));
    await Promise.all(updates);
    await load();
  };

  return { stages, loading, create, update, remove, reorder, reload: load };
}

export function useLeads(pipelineId: string | null) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pipelineId) { setLeads([]); setLoading(false); return; }
    const { data: leadsData } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("pipeline_id", pipelineId)
      .order("updated_at", { ascending: false });

    if (!leadsData) { setLeads([]); setLoading(false); return; }

    // Load tags for all leads
    const leadIds = leadsData.map(l => l.id);
    const { data: leadTags } = await supabase
      .from("crm_lead_tags")
      .select("lead_id, tag_id, crm_tags(*)")
      .in("lead_id", leadIds.length > 0 ? leadIds : ["none"]);

    const tagMap: Record<string, Tag[]> = {};
    leadTags?.forEach((lt: any) => {
      if (!tagMap[lt.lead_id]) tagMap[lt.lead_id] = [];
      if (lt.crm_tags) tagMap[lt.lead_id].push(lt.crm_tags);
    });

    const enriched = leadsData.map(l => ({ ...l, tags: tagMap[l.id] || [] }));
    setLeads(enriched);
    setLoading(false);
  }, [pipelineId]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!pipelineId) return;
    const channel = supabase
      .channel(`crm-leads-${pipelineId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "crm_leads", filter: `pipeline_id=eq.${pipelineId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [pipelineId, load]);

  const create = async (lead: { name: string; email?: string; phone?: string; company?: string; source?: string; opportunity_value?: number; billing_type?: string; stage_id: string; notes?: string }) => {
    if (!pipelineId) return null;
    const { data, error } = await supabase.from("crm_leads").insert({ ...lead, pipeline_id: pipelineId }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return null; }
    await load();
    return data;
  };

  const update = async (id: string, updates: Partial<Lead>) => {
    await supabase.from("crm_leads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
    await load();
  };

  const moveToStage = async (leadId: string, newStageId: string, oldStageId: string, oldStageName: string, newStageName: string) => {
    await supabase.from("crm_leads").update({
      stage_id: newStageId,
      last_stage_change_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", leadId);

    // Log activity
    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      activity_type: "stage_change",
      content: `Movido de "${oldStageName}" para "${newStageName}"`,
      metadata: { from_stage: oldStageId, to_stage: newStageId },
    });

    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("crm_leads").delete().eq("id", id);
    await load();
  };

  const bulkMove = async (leadIds: string[], stageId: string, stageName: string) => {
    await Promise.all(leadIds.map(id =>
      supabase.from("crm_leads").update({ stage_id: stageId, last_stage_change_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id)
    ));
    await load();
  };

  const bulkDelete = async (leadIds: string[]) => {
    await Promise.all(leadIds.map(id => supabase.from("crm_leads").delete().eq("id", id)));
    await load();
  };

  return { leads, loading, create, update, moveToStage, remove, bulkMove, bulkDelete, reload: load };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("crm_tags").select("*").order("label");
    setTags(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (label: string, color: string = "#6366f1") => {
    await supabase.from("crm_tags").insert({ label, color });
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("crm_tags").delete().eq("id", id);
    await load();
  };

  const addToLead = async (leadId: string, tagId: string) => {
    await supabase.from("crm_lead_tags").insert({ lead_id: leadId, tag_id: tagId });
  };

  const removeFromLead = async (leadId: string, tagId: string) => {
    await supabase.from("crm_lead_tags").delete().eq("lead_id", leadId).eq("tag_id", tagId);
  };

  return { tags, create, remove, addToLead, removeFromLead, reload: load };
}

export function useActivities(leadId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    if (!leadId) { setActivities([]); return; }
    const { data } = await supabase.from("crm_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(50);
    setActivities(data || []);
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const addNote = async (content: string) => {
    if (!leadId) return;
    await supabase.from("crm_activities").insert({ lead_id: leadId, activity_type: "note", content });
    await load();
  };

  const logAction = async (type: string, content: string, metadata?: any) => {
    if (!leadId) return;
    await supabase.from("crm_activities").insert({ lead_id: leadId, activity_type: type, content, metadata });
    await load();
  };

  return { activities, addNote, logAction, reload: load };
}

export function useTasks(leadId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    if (!leadId) { setTasks([]); return; }
    const { data } = await supabase.from("crm_tasks").select("*").eq("lead_id", leadId).order("due_date", { ascending: true });
    setTasks(data || []);
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const create = async (title: string, description?: string, dueDate?: string) => {
    if (!leadId) return;
    await supabase.from("crm_tasks").insert({ lead_id: leadId, title, description, due_date: dueDate });
    await load();
  };

  const toggle = async (id: string, completed: boolean) => {
    await supabase.from("crm_tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    await supabase.from("crm_tasks").delete().eq("id", id);
    await load();
  };

  return { tasks, create, toggle, remove, reload: load };
}
