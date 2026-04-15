import { useState } from "react";
import { Lead, Stage, Tag, useActivities, useTasks } from "@/hooks/useCRM";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Phone, Mail, Trash2, Plus, Clock, Send, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  stages: Stage[];
  tags: Tag[];
  onUpdate: (updates: Partial<Lead>) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddTag: (tagId: string) => Promise<void>;
  onRemoveTag: (tagId: string) => Promise<void>;
}

const LeadDetailDialog = ({ open, onOpenChange, lead, stages, tags, onUpdate, onDelete, onAddTag, onRemoveTag }: Props) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...lead });
  const [noteText, setNoteText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  const { activities, addNote, logAction } = useActivities(lead.id);
  const { tasks, create: createTask, toggle: toggleTask, remove: removeTask } = useTasks(lead.id);

  const handleSave = async () => {
    await onUpdate({
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      source: form.source,
      opportunity_value: form.opportunity_value,
      billing_type: form.billing_type,
      notes: form.notes,
      stage_id: form.stage_id,
    });
    setEditing(false);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(noteText);
    setNoteText("");
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    await createTask(taskTitle, undefined, taskDue || undefined);
    setTaskTitle("");
    setTaskDue("");
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const activityIcon = (type: string) => {
    switch (type) {
      case "stage_change": return "🔄";
      case "note": return "📝";
      case "whatsapp": return "💬";
      case "call": return "📞";
      case "email": return "📧";
      case "task": return "✅";
      default: return "⚡";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{lead.name}</span>
            <div className="flex gap-1">
              {lead.phone && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`, "_blank")}>
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </Button>
              )}
              {lead.phone && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={`tel:${lead.phone}`}><Phone className="w-4 h-4 text-blue-500" /></a>
                </Button>
              )}
              {lead.email && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={`mailto:${lead.email}`}><Mail className="w-4 h-4 text-orange-500" /></a>
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tarefas ({tasks.filter(t => !t.completed).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={!editing} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Empresa</Label>
                <Input value={form.company || ""} onChange={e => setForm({ ...form, company: e.target.value })} disabled={!editing} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Telefone</Label>
                <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={!editing} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">E-mail</Label>
                <Input value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!editing} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Origem</Label>
                <Input value={form.source || ""} onChange={e => setForm({ ...form, source: e.target.value })} disabled={!editing} className="mt-1" placeholder="ex: Tráfego Pago" />
              </div>
              <div>
                <Label className="text-xs">Etapa</Label>
                <Select value={form.stage_id} onValueChange={v => setForm({ ...form, stage_id: v })} disabled={!editing}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor da Oportunidade (R$)</Label>
                <Input type="number" value={form.opportunity_value || ""} onChange={e => setForm({ ...form, opportunity_value: parseFloat(e.target.value) || 0 })} disabled={!editing} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tipo de Faturamento</Label>
                <Select value={form.billing_type || "one-time"} onValueChange={v => setForm({ ...form, billing_type: v })} disabled={!editing}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">Pagamento Único</SelectItem>
                    <SelectItem value="recurring">Recorrente (MRR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Notas</Label>
              <Textarea value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} disabled={!editing} className="mt-1 min-h-[80px]" />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-xs">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {lead.tags?.map(t => (
                  <span key={t.id} className="text-xs px-2 py-0.5 rounded-full text-white flex items-center gap-1" style={{ backgroundColor: t.color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setForm({ ...lead }); setEditing(false); }}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave}>Salvar</Button>
                </>
              ) : (
                <>
                  <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 className="w-3 h-3 mr-1" /> Excluir</Button>
                  <Button size="sm" onClick={() => setEditing(true)}>Editar</Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4 space-y-3">
            {/* Add note */}
            <div className="flex gap-2">
              <Input placeholder="Adicionar anotação..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNote()} className="flex-1" />
              <Button size="sm" onClick={handleAddNote}><Send className="w-3 h-3" /></Button>
            </div>

            {/* Activity feed */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {activities.map(a => (
                <div key={a.id} className="flex gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                  <span className="shrink-0">{activityIcon(a.activity_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(a.created_at)}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-3">
            {/* Add task */}
            <div className="flex gap-2">
              <Input placeholder="Nova tarefa..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="flex-1" />
              <Input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} className="w-[140px]" />
              <Button size="sm" onClick={handleAddTask}><Plus className="w-3 h-3" /></Button>
            </div>

            {/* Task list */}
            <div className="space-y-1">
              {tasks.map(t => (
                <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border ${t.completed ? "bg-muted/20 opacity-60" : "bg-card"}`}>
                  <Checkbox checked={t.completed} onCheckedChange={(c) => toggleTask(t.id, !!c)} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                    {t.due_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(t.due_date).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTask(t.id)}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa</p>}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailDialog;
