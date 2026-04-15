import { useState } from "react";
import { Stage, Tag } from "@/hooks/useCRM";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  tags: Tag[];
  onSave: (lead: { name: string; email?: string; phone?: string; company?: string; source?: string; opportunity_value?: number; billing_type?: string; stage_id: string; notes?: string }) => Promise<void>;
}

const LeadFormDialog = ({ open, onOpenChange, stages, tags, onSave }: Props) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", source: "",
    opportunity_value: 0, billing_type: "one-time",
    stage_id: stages[0]?.id || "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.stage_id) return;
    setSaving(true);
    await onSave({
      ...form,
      opportunity_value: form.opportunity_value || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source || undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: "", email: "", phone: "", company: "", source: "", opportunity_value: 0, billing_type: "one-time", stage_id: stages[0]?.id || "", notes: "" });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nome *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Nome do lead" />
          </div>
          <div>
            <Label className="text-xs">Telefone</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label className="text-xs">E-mail</Label>
            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label className="text-xs">Empresa</Label>
            <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Origem</Label>
            <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="mt-1" placeholder="ex: Meta Ads" />
          </div>
          <div>
            <Label className="text-xs">Etapa Inicial</Label>
            <Select value={form.stage_id} onValueChange={v => setForm({ ...form, stage_id: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Valor (R$)</Label>
            <Input type="number" value={form.opportunity_value || ""} onChange={e => setForm({ ...form, opportunity_value: parseFloat(e.target.value) || 0 })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Faturamento</Label>
            <Select value={form.billing_type} onValueChange={v => setForm({ ...form, billing_type: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">Pagamento Único</SelectItem>
                <SelectItem value="recurring">Recorrente (MRR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Salvando..." : "Criar Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormDialog;
