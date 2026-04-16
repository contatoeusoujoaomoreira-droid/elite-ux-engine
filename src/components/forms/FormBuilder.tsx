import { useState, useEffect } from "react";
import { FormRecord, useFormFields } from "@/hooks/useForms";
import { usePipelines, useStages } from "@/hooks/useCRM";
import FormFieldEditor from "./FormFieldEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Save, Eye, Link2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  form: FormRecord;
  onUpdate: (id: string, updates: Partial<FormRecord>) => Promise<void>;
  onBack: () => void;
}

const FormBuilder = ({ form, onUpdate, onBack }: Props) => {
  const { fields, create: createField, update: updateField, remove: removeField, reload: reloadFields } = useFormFields(form.id);
  const { pipelines } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(form.pipeline_id);
  const { stages } = useStages(selectedPipelineId);

  const [title, setTitle] = useState(form.title);
  const [slug, setSlug] = useState(form.slug);
  const [description, setDescription] = useState(form.description || "");
  const [stageId, setStageId] = useState<string | null>(form.stage_id);
  const [published, setPublished] = useState(form.status === "published");
  const [themeConfig, setThemeConfig] = useState(form.theme_config || {});
  const [thankYouMessage, setThankYouMessage] = useState((form.settings as any)?.thank_you_message || "Obrigado! Entraremos em contato em breve.");

  const publicUrl = `${window.location.origin}/f/${slug}`;

  const handleSave = async () => {
    await onUpdate(form.id, {
      title,
      slug,
      description: description || null,
      pipeline_id: selectedPipelineId,
      stage_id: stageId,
      status: published ? "published" : "draft",
      theme_config: themeConfig,
      settings: { thank_you_message: thankYouMessage } as any,
    });
    toast.success("Formulário salvo!");
  };

  const handleAddField = async () => {
    await createField({
      form_id: form.id,
      type: "text",
      label: "Nova pergunta",
      required: false,
      position: fields.length,
    } as any);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" disabled={!published}>
              <Eye className="w-4 h-4 mr-1" /> Preview
            </Button>
          </a>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="fields">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="fields">Campos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="crm">Integração CRM</TabsTrigger>
          <TabsTrigger value="theme">Tema</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Campos do Formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((f) => (
                <FormFieldEditor
                  key={f.id}
                  field={f}
                  onUpdate={updateField}
                  onDelete={removeField}
                />
              ))}
              <Button variant="outline" className="w-full" onClick={handleAddField}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Campo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <div className="flex items-center gap-2">
                  <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
                  <Button variant="outline" size="icon" onClick={copyLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> {publicUrl}
                </p>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>Mensagem de Agradecimento</Label>
                <Textarea value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={published} onCheckedChange={setPublished} />
                <Label>Publicado</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Quando alguém preencher o formulário, um Lead será criado automaticamente no CRM.
              </p>
              <div>
                <Label>Pipeline</Label>
                <Select value={selectedPipelineId || ""} onValueChange={(v) => { setSelectedPipelineId(v); setStageId(null); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione um pipeline" /></SelectTrigger>
                  <SelectContent>
                    {pipelines.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPipelineId && (
                <div>
                  <Label>Etapa inicial do Lead</Label>
                  <Select value={stageId || ""} onValueChange={setStageId}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma etapa" /></SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Use o "Mapeamento CRM" em cada campo para definir qual informação vai para o Lead (nome, e-mail, telefone, etc).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4 mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(themeConfig as any).primaryColor || "#FBBF24"}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <Input
                      value={(themeConfig as any).primaryColor || "#FBBF24"}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(themeConfig as any).backgroundColor || "#0a0a0a"}
                      onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <Input
                      value={(themeConfig as any).backgroundColor || "#0a0a0a"}
                      onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormBuilder;
