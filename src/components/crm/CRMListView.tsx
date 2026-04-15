import { useState, useMemo } from "react";
import { Stage, Lead, Tag, STAGNATION_DAYS } from "@/hooks/useCRM";
import LeadDetailDialog from "./LeadDetailDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowUpDown, MessageCircle, Phone, Mail, Search, MoveRight } from "lucide-react";

interface Props {
  stages: Stage[];
  leads: Lead[];
  tags: Tag[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onBulkMove: (ids: string[], stageId: string, stageName: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onReloadLeads: () => Promise<void>;
}

type SortKey = "name" | "company" | "opportunity_value" | "created_at" | "updated_at";

const CRMListView = ({ stages, leads, tags, onUpdateLead, onDeleteLead, onBulkMove, onBulkDelete, onReloadLeads }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStage, setFilterStage] = useState<string>("all");
  const [bulkMoveStage, setBulkMoveStage] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (filterStage !== "all") result = result.filter(l => l.stage_id === filterStage);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return result;
  }, [leads, filterStage, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(l => l.id)));
  };

  const handleBulkMove = async () => {
    if (!bulkMoveStage || selected.size === 0) return;
    const stage = stages.find(s => s.id === bulkMoveStage);
    await onBulkMove(Array.from(selected), bulkMoveStage, stage?.name || "");
    setSelected(new Set());
    setBulkMoveStage("");
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    await onBulkDelete(Array.from(selected));
    setSelected(new Set());
  };

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "-";

  const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Todas etapas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas etapas</SelectItem>
            {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-sm text-foreground font-medium">{selected.size} selecionados</span>
          <Select value={bulkMoveStage} onValueChange={setBulkMoveStage}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Mover para..." />
            </SelectTrigger>
            <SelectContent>
              {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={handleBulkMove} disabled={!bulkMoveStage} className="h-8">
            <MoveRight className="w-3 h-3 mr-1" /> Mover
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8">
            <Trash2 className="w-3 h-3 mr-1" /> Excluir
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} /></TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>Nome <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("company")}>Empresa <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("opportunity_value")}>Valor <ArrowUpDown className="inline w-3 h-3 ml-1" /></TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(lead => {
              const stage = stageMap[lead.stage_id];
              const stagnant = stage?.status_type === "open" && (Date.now() - new Date(lead.last_stage_change_at).getTime()) / (1000 * 60 * 60 * 24) >= STAGNATION_DAYS;
              return (
                <TableRow key={lead.id} className={`cursor-pointer ${stagnant ? "bg-destructive/5" : ""}`} onClick={() => setSelectedLead(lead)}>
                  <TableCell onClick={e => e.stopPropagation()}><Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} /></TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.company || "-"}</TableCell>
                  <TableCell>
                    {stage && (
                      <Badge variant="outline" className="text-xs" style={{ borderColor: stage.color || undefined, color: stage.color || undefined }}>
                        {stage.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(lead.opportunity_value)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{lead.source || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {lead.tags?.slice(0, 2).map(t => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>{t.label}</span>
                      ))}
                      {(lead.tags?.length || 0) > 2 && <span className="text-[10px] text-muted-foreground">+{(lead.tags?.length || 0) - 2}</span>}
                    </div>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {lead.phone && <button onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`, "_blank")} className="p-1 rounded hover:bg-primary/10"><MessageCircle className="w-3.5 h-3.5 text-green-500" /></button>}
                      {lead.phone && <a href={`tel:${lead.phone}`} className="p-1 rounded hover:bg-primary/10"><Phone className="w-3.5 h-3.5 text-blue-500" /></a>}
                      {lead.email && <a href={`mailto:${lead.email}`} className="p-1 rounded hover:bg-primary/10"><Mail className="w-3.5 h-3.5 text-orange-500" /></a>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum lead encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLead && (
        <LeadDetailDialog
          open={!!selectedLead}
          onOpenChange={(open) => { if (!open) setSelectedLead(null); }}
          lead={selectedLead}
          stages={stages}
          tags={tags}
          onUpdate={async (updates) => { await onUpdateLead(selectedLead.id, updates); await onReloadLeads(); }}
          onDelete={async () => { await onDeleteLead(selectedLead.id); setSelectedLead(null); }}
          onAddTag={async (tagId) => { /* handled in detail */ }}
          onRemoveTag={async (tagId) => { /* handled in detail */ }}
        />
      )}
    </div>
  );
};

export default CRMListView;
