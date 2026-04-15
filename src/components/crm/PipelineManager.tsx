import { useState } from "react";
import { Pipeline } from "@/hooks/useCRM";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelines: Pipeline[];
  onCreate: (name: string, description?: string) => Promise<Pipeline | null>;
  onUpdate: (id: string, updates: Partial<Pipeline>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PipelineManager = ({ open, onOpenChange, pipelines, onCreate, onUpdate, onDelete }: Props) => {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName);
    setNewName("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await onUpdate(id, { name: editName });
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Gerenciar Pipelines</DialogTitle></DialogHeader>

        <div className="flex gap-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do pipeline" onKeyDown={e => e.key === "Enter" && handleCreate()} />
          <Button size="sm" onClick={handleCreate}><Plus className="w-4 h-4" /></Button>
        </div>

        <div className="space-y-2 mt-2">
          {pipelines.map(p => (
            <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
              {editingId === p.id ? (
                <>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 h-8" onKeyDown={e => e.key === "Enter" && handleUpdate(p.id)} />
                  <Button size="sm" variant="outline" className="h-8" onClick={() => handleUpdate(p.id)}>Salvar</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>✕</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-foreground">{p.name}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(p.id); setEditName(p.name); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(p.id)}>
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

export default PipelineManager;
