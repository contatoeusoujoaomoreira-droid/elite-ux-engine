import { useState } from "react";
import { Stage, Lead, Tag, STAGNATION_DAYS } from "@/hooks/useCRM";
import LeadDetailDialog from "./LeadDetailDialog";
import { Phone, Mail, MessageCircle, DollarSign, Clock, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Props {
  stages: Stage[];
  leads: Lead[];
  tags: Tag[];
  onMoveLead: (leadId: string, newStageId: string, oldStageId: string, oldStageName: string, newStageName: string) => Promise<void>;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onAddTag: (leadId: string, tagId: string) => Promise<void>;
  onRemoveTag: (leadId: string, tagId: string) => Promise<void>;
  onReloadLeads: () => Promise<void>;
}

const isStagnant = (lead: Lead) => {
  const diff = (Date.now() - new Date(lead.last_stage_change_at).getTime()) / (1000 * 60 * 60 * 24);
  return diff >= STAGNATION_DAYS;
};

const CRMKanban = ({ stages, leads, tags, onMoveLead, onUpdateLead, onDeleteLead, onAddTag, onRemoveTag, onReloadLeads }: Props) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedLead || draggedLead.stage_id === targetStage.id) { setDraggedLead(null); return; }
    const oldStage = stages.find(s => s.id === draggedLead.stage_id);
    await onMoveLead(draggedLead.id, targetStage.id, draggedLead.stage_id, oldStage?.name || "", targetStage.name);
    setDraggedLead(null);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4 min-w-max">
          {stages.map(stage => {
            const stageLeads = leads.filter(l => l.stage_id === stage.id);
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.opportunity_value || 0), 0);

            return (
              <div
                key={stage.id}
                className={`w-[280px] shrink-0 rounded-xl border bg-card/50 flex flex-col max-h-[calc(100vh-220px)] transition-colors ${dragOverStage === stage.id ? "border-primary bg-primary/5" : "border-border/50"}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className="p-3 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color || "#6366f1" }} />
                      <span className="font-medium text-sm text-foreground">{stage.name}</span>
                      <Badge variant="secondary" className="text-xs px-1.5">{stageLeads.length}</Badge>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {stage.status_type === "won" ? "✅ Ganho" : stage.status_type === "lost" ? "❌ Perdido" : "🔵 Aberto"}
                    </Badge>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(stageValue)}
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stageLeads.map(lead => {
                    const stagnant = isStagnant(lead) && stage.status_type === "open";
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onClick={() => setSelectedLead(lead)}
                        className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 bg-card ${stagnant ? "border-destructive/50 shadow-destructive/10" : "border-border/30"} ${draggedLead?.id === lead.id ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-foreground truncate">{lead.name}</p>
                            {lead.company && <p className="text-xs text-muted-foreground truncate">{lead.company}</p>}
                          </div>
                          <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                        </div>

                        {lead.opportunity_value ? (
                          <p className="text-xs font-semibold text-primary mt-1.5 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> {formatCurrency(lead.opportunity_value)}
                            {lead.billing_type === "recurring" && <Badge variant="outline" className="text-[9px] ml-1">MRR</Badge>}
                          </p>
                        ) : null}

                        {/* Tags */}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.tags.map(tag => (
                              <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: tag.color }}>
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Quick actions + stagnation */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                          <div className="flex gap-1">
                            {lead.phone && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`, "_blank"); }} className="p-1 rounded hover:bg-primary/10 transition-colors" title="WhatsApp">
                                <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                              </button>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-primary/10 transition-colors" title="Ligar">
                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                              </a>
                            )}
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-primary/10 transition-colors" title="E-mail">
                                <Mail className="w-3.5 h-3.5 text-orange-500" />
                              </a>
                            )}
                          </div>
                          {stagnant && (
                            <span className="text-[10px] text-destructive flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Parado
                            </span>
                          )}
                          {lead.source && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{lead.source}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedLead && (
        <LeadDetailDialog
          open={!!selectedLead}
          onOpenChange={(open) => { if (!open) setSelectedLead(null); }}
          lead={selectedLead}
          stages={stages}
          tags={tags}
          onUpdate={async (updates) => { await onUpdateLead(selectedLead.id, updates); await onReloadLeads(); }}
          onDelete={async () => { await onDeleteLead(selectedLead.id); setSelectedLead(null); }}
          onAddTag={async (tagId) => { await onAddTag(selectedLead.id, tagId); await onReloadLeads(); }}
          onRemoveTag={async (tagId) => { await onRemoveTag(selectedLead.id, tagId); await onReloadLeads(); }}
        />
      )}
    </>
  );
};

export default CRMKanban;
