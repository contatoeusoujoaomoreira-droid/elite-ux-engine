import { useState } from "react";
import { FormField } from "@/hooks/useForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { GripVertical, Trash2, Plus, X } from "lucide-react";

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "number", label: "Número" },
  { value: "textarea", label: "Texto longo" },
  { value: "select", label: "Seleção" },
  { value: "rating", label: "Avaliação (1-5)" },
  { value: "yes_no", label: "Sim/Não" },
  { value: "date", label: "Data" },
  { value: "opinion_scale", label: "Escala (0-10)" },
];

const crmMappings = [
  { value: "", label: "Nenhum" },
  { value: "name", label: "Nome do Lead" },
  { value: "email", label: "E-mail do Lead" },
  { value: "phone", label: "Telefone do Lead" },
  { value: "company", label: "Empresa" },
  { value: "source", label: "Origem" },
  { value: "notes", label: "Observações" },
  { value: "opportunity_value", label: "Valor da Oportunidade" },
];

interface Props {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
}

const FormFieldEditor = ({ field, onUpdate, onDelete }: Props) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    (field.options as any[]) || []
  );

  const addOption = () => {
    const newOpts = [...options, { label: "", value: "" }];
    setOptions(newOpts);
    onUpdate(field.id, { options: newOpts as any });
  };

  const updateOption = (idx: number, key: "label" | "value", val: string) => {
    const newOpts = [...options];
    newOpts[idx] = { ...newOpts[idx], [key]: val };
    if (key === "label" && !newOpts[idx].value) {
      newOpts[idx].value = val.toLowerCase().replace(/\s+/g, "-");
    }
    setOptions(newOpts);
    onUpdate(field.id, { options: newOpts as any });
  };

  const removeOption = (idx: number) => {
    const newOpts = options.filter((_, i) => i !== idx);
    setOptions(newOpts);
    onUpdate(field.id, { options: newOpts as any });
  };

  const showOptions = field.type === "select";

  return (
    <Card className="p-4 bg-card/50 border-border/50 space-y-3">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={field.type} onValueChange={(v) => onUpdate(field.id, { type: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fieldTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              className="h-8 text-xs"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => onDelete(field.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Placeholder</Label>
          <Input
            className="h-8 text-xs"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Mapeamento CRM</Label>
          <Select value={field.field_mapping || ""} onValueChange={(v) => onUpdate(field.id, { field_mapping: v || null })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              {crmMappings.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={field.required}
              onCheckedChange={(v) => onUpdate(field.id, { required: v })}
            />
            <Label className="text-xs">Obrigatório</Label>
          </div>
        </div>
      </div>

      {showOptions && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Opções</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input className="h-7 text-xs flex-1" placeholder="Label" value={opt.label} onChange={(e) => updateOption(i, "label", e.target.value)} />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOption(i)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={addOption}>
            <Plus className="w-3 h-3 mr-1" /> Opção
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FormFieldEditor;
