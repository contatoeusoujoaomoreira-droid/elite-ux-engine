import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FormRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  status: string;
  theme_config: Record<string, any>;
  settings: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  position: number;
  options: any[];
  validation: Record<string, any>;
  conditional_logic: Record<string, any> | null;
  field_mapping: string | null;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  lead_id: string | null;
  data: Record<string, any>;
  metadata: Record<string, any>;
  started_at: string | null;
  completed_at: string | null;
  dropped_at_field: string | null;
  created_at: string;
}

export function useForms() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });
    setForms((data as any as FormRecord[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (form: Partial<FormRecord>) => {
    const { data, error } = await supabase.from("forms").insert(form as any).select().single();
    if (error) throw error;
    await load();
    return data as any as FormRecord;
  };

  const update = async (id: string, updates: Partial<FormRecord>) => {
    const { error } = await supabase.from("forms").update(updates as any).eq("id", id);
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("forms").delete().eq("id", id);
    if (error) throw error;
    await load();
  };

  return { forms, loading, create, update, remove, reload: load };
}

export function useFormFields(formId: string | null) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!formId) { setFields([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("position");
    setFields((data as any as FormField[]) || []);
    setLoading(false);
  }, [formId]);

  useEffect(() => { load(); }, [load]);

  const create = async (field: Partial<FormField>) => {
    const { data, error } = await supabase.from("form_fields").insert(field as any).select().single();
    if (error) throw error;
    await load();
    return data as any as FormField;
  };

  const update = async (id: string, updates: Partial<FormField>) => {
    const { error } = await supabase.from("form_fields").update(updates as any).eq("id", id);
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("form_fields").delete().eq("id", id);
    if (error) throw error;
    await load();
  };

  const reorder = async (orderedIds: string[]) => {
    await Promise.all(orderedIds.map((id, i) =>
      supabase.from("form_fields").update({ position: i } as any).eq("id", id)
    ));
    await load();
  };

  return { fields, loading, create, update, remove, reorder, reload: load };
}

export function useFormSubmissions(formId: string | null) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!formId) { setSubmissions([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("form_submissions")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });
    setSubmissions((data as any as FormSubmission[]) || []);
    setLoading(false);
  }, [formId]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    if (!formId) return;
    const channel = supabase
      .channel(`form-subs-${formId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "form_submissions", filter: `form_id=eq.${formId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [formId, load]);

  return { submissions, loading, reload: load };
}

// Public: fetch form + fields by slug
export async function fetchPublicForm(slug: string) {
  const { data: form, error } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !form) return null;

  const { data: fields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", (form as any).id)
    .order("position");

  return { form: form as any as FormRecord, fields: (fields as any as FormField[]) || [] };
}

// Public: submit form
export async function submitPublicForm(
  formId: string,
  data: Record<string, any>,
  metadata: Record<string, any>,
  startedAt: string | null,
  pipelineId: string | null,
  stageId: string | null,
  fieldMappings: Record<string, string>
) {
  // Create lead if CRM is configured
  let leadId: string | null = null;
  if (pipelineId && stageId) {
    const leadData: Record<string, any> = {
      pipeline_id: pipelineId,
      stage_id: stageId,
      name: "Lead via Form",
      source: "form",
    };
    // Map fields
    Object.entries(fieldMappings).forEach(([fieldId, crmField]) => {
      if (data[fieldId] !== undefined && crmField) {
        if (crmField === "opportunity_value") {
          leadData[crmField] = parseFloat(data[fieldId]) || 0;
        } else {
          leadData[crmField] = data[fieldId];
        }
      }
    });
    if (leadData.name === "Lead via Form" && !fieldMappings) {
      leadData.name = data[Object.keys(data)[0]] || "Lead via Form";
    }
    const { data: lead } = await supabase.from("crm_leads").insert(leadData as any).select("id").single();
    if (lead) leadId = (lead as any).id;
  }

  const { error } = await supabase.from("form_submissions").insert({
    form_id: formId,
    lead_id: leadId,
    data,
    metadata,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
  } as any);

  return { error, leadId };
}
