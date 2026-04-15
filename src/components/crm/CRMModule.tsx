import { useState, useEffect } from "react";
import { usePipelines, useStages, useLeads, useTags, Pipeline } from "@/hooks/useCRM";
import CRMKanban from "./CRMKanban";
import CRMListView from "./CRMListView";
import CRMDashboard from "./CRMDashboard";
import PipelineManager from "./PipelineManager";
import StageManager from "./StageManager";
import LeadFormDialog from "./LeadFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List, Plus, BarChart3, Settings2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CRMView = "kanban" | "list" | "dashboard";

const CRMModule = () => {
  const { pipelines, loading: pipelinesLoading, create: createPipeline, update: updatePipeline, remove: removePipeline, reload: reloadPipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [view, setView] = useState<CRMView>("kanban");
  const [showPipelineManager, setShowPipelineManager] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const { stages, loading: stagesLoading, create: createStage, update: updateStage, remove: removeStage, reorder: reorderStages, reload: reloadStages } = useStages(selectedPipelineId);
  const { leads, loading: leadsLoading, create: createLead, update: updateLead, moveToStage, remove: removeLead, bulkMove, bulkDelete, reload: reloadLeads } = useLeads(selectedPipelineId);
  const { tags, create: createTag, remove: removeTag, addToLead: addTagToLead, removeFromLead: removeTagFromLead } = useTags();

  // Auto-select first pipeline
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  // Auto-create default pipeline if none exist
  useEffect(() => {
    if (!pipelinesLoading && pipelines.length === 0) {
      createPipeline("Funil de Vendas", "Pipeline principal de vendas").then((p) => {
        if (p) {
          setSelectedPipelineId(p.id);
          // Create default stages
          const defaultStages = [
            { name: "Novo Lead", status: "open", color: "#6366f1" },
            { name: "Qualificação", status: "open", color: "#8b5cf6" },
            { name: "Proposta", status: "open", color: "#f59e0b" },
            { name: "Negociação", status: "open", color: "#3b82f6" },
            { name: "Ganho", status: "won", color: "#22c55e" },
            { name: "Perdido", status: "lost", color: "#ef4444" },
          ];
          defaultStages.reduce((chain, s, i) => {
            return chain.then(() =>
              import("@/integrations/supabase/client").then(({ supabase }) =>
                supabase.from("crm_stages").insert({ pipeline_id: p.id, name: s.name, position: i, status_type: s.status, color: s.color })
              )
            );
          }, Promise.resolve() as any).then(() => reloadStages());
        }
      });
    }
  }, [pipelinesLoading, pipelines.length]);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  if (pipelinesLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando CRM...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedPipelineId || ""} onValueChange={setSelectedPipelineId}>
            <SelectTrigger className="w-[220px] bg-card border-border">
              <SelectValue placeholder="Selecione um pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setShowPipelineManager(true)}>
            <Settings2 className="w-4 h-4 mr-1" /> Pipelines
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowStageManager(true)} disabled={!selectedPipelineId}>
            <Settings2 className="w-4 h-4 mr-1" /> Etapas
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as CRMView)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="kanban" className="gap-1"><LayoutGrid className="w-4 h-4" /> Kanban</TabsTrigger>
              <TabsTrigger value="list" className="gap-1"><List className="w-4 h-4" /> Lista</TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-1"><BarChart3 className="w-4 h-4" /> KPIs</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" onClick={() => setShowLeadForm(true)} disabled={!selectedPipelineId || stages.length === 0}>
            <Plus className="w-4 h-4 mr-1" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* Main content */}
      {view === "kanban" && selectedPipelineId && (
        <CRMKanban
          stages={stages}
          leads={leads}
          tags={tags}
          onMoveLead={moveToStage}
          onUpdateLead={updateLead}
          onDeleteLead={removeLead}
          onAddTag={addTagToLead}
          onRemoveTag={removeTagFromLead}
          onReloadLeads={reloadLeads}
        />
      )}

      {view === "list" && selectedPipelineId && (
        <CRMListView
          stages={stages}
          leads={leads}
          tags={tags}
          onUpdateLead={updateLead}
          onDeleteLead={removeLead}
          onBulkMove={bulkMove}
          onBulkDelete={bulkDelete}
          onReloadLeads={reloadLeads}
        />
      )}

      {view === "dashboard" && selectedPipelineId && (
        <CRMDashboard stages={stages} leads={leads} pipelineId={selectedPipelineId} />
      )}

      {!selectedPipelineId && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
          <p>Nenhum pipeline encontrado. Crie um para começar.</p>
          <Button onClick={() => setShowPipelineManager(true)}>Criar Pipeline</Button>
        </div>
      )}

      {/* Dialogs */}
      <PipelineManager
        open={showPipelineManager}
        onOpenChange={setShowPipelineManager}
        pipelines={pipelines}
        onCreate={createPipeline}
        onUpdate={updatePipeline}
        onDelete={removePipeline}
      />

      {selectedPipelineId && (
        <StageManager
          open={showStageManager}
          onOpenChange={setShowStageManager}
          stages={stages}
          onCreate={createStage}
          onUpdate={updateStage}
          onDelete={removeStage}
        />
      )}

      {selectedPipelineId && stages.length > 0 && (
        <LeadFormDialog
          open={showLeadForm}
          onOpenChange={setShowLeadForm}
          stages={stages}
          tags={tags}
          onSave={async (lead) => {
            await createLead(lead);
            setShowLeadForm(false);
          }}
        />
      )}
    </div>
  );
};

export default CRMModule;
