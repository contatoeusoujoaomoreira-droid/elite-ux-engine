import { useState } from "react";
import { Stage } from "@/hooks/useCRM";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  onCreate: (name: string, statusType?: string, color?: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Stage>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

const StageManager = ({ open, onOpenChange, stages, onCreate, onUpdate, onDelete }: Props) => {
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("open");
  const [newColor, setNewColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", status_type: "open", color: "#6366f1" });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName, newStatus, newColor);
    setNewName("");
  };

  const handleUpdate = async (id: string) => {
    await onUpdate(id, { name: editForm.name, status_type: editForm.status_type, color: editForm.color });
    setEditingId(null);
  };

  const statusLabel = (s: string) => s === "won" ? "✅ Ganho" : s === "lost" ? "❌ Perdido" : "🔵 Aberto";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Gerenciar Etapas</DialogTitle></DialogHeader>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da etapa" onKeyDown={e => e.key === "Enter" && handleCreate()} />
          </div>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">🔵 Aberto</SelectItem>
              <SelectItem value="won">✅ Ganho</SelectItem>
              <SelectItem value="lost">❌ Perdido</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {COLORS.slice(0, 4).map(c => (
              <button key={c} className={`w-5 h-5 rounded-full border-2 ${newColor === c ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setNewColor(c)} />
            ))}
          </div>
          <Button size="sm" onClick={handleCreate}><Plus className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-2 mt-2">
          {stages.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
              <GripVertical className="w-4 h-4 text-muted-foreground/30" />
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color || "#6366f1" }} />

              {editingId === s.id ? (
                <>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="flex-1 h-8" />
                  <Select value={editForm.status_type} onValueChange={v => setEditForm({ ...editForm, status_type: v })}>
                    <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="won">Ganho</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => handleUpdate(s.id)}>OK</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>✕</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{s.name}</span>
                  <Badge variant="outline" className="text-[10px]">{statusLabel(s.status_type)}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(s.id); setEditForm({ name: s.name, status_type: s.status_type, color: s.color || "#6366f1" }); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(s.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StageManager;
