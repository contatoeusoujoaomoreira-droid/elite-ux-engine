import { useState } from "react";
import { useForms, FormRecord, useFormSubmissions } from "@/hooks/useForms";
import { usePipelines, useStages } from "@/hooks/useCRM";
import FormBuilder from "./FormBuilder";
import FormAnalytics from "./FormAnalytics";
import { formTemplates } from "./FormTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, BarChart3, Link2, Copy, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

type View = "list" | "builder" | "analytics";

const FormsModule = () => {
  const { forms, loading, create, update, remove, reload } = useForms();
  const [view, setView] = useState<View>("list");
  const [selectedForm, setSelectedForm] = useState<FormRecord | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const openBuilder = (form: FormRecord) => {
    setSelectedForm(form);
    setView("builder");
  };

  const openAnalytics = (form: FormRecord) => {
    setSelectedForm(form);
    setView("analytics");
  };

  const handleCreate = async () => {
    if (!newTitle || !newSlug) { toast.error("Preencha título e slug"); return; }
    try {
      const form = await create({ title: newTitle, slug: newSlug, status: "draft" } as any);
      setShowCreateDialog(false);
      setNewTitle("");
      setNewSlug("");
      openBuilder(form);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar formulário");
    }
  };

  const handleUseTemplate = async (tpl: typeof formTemplates[0]) => {
    try {
      const form = await create({
        title: tpl.title,
        slug: tpl.slug + "-" + Date.now().toString(36),
        description: tpl.description,
        status: "draft",
      } as any);
      // Create fields from template
      const { supabase } = await import("@/integrations/supabase/client");
      for (let i = 0; i < tpl.fields.length; i++) {
        const f = tpl.fields[i];
        await supabase.from("form_fields").insert({
          form_id: form.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder || null,
          required: f.required,
          position: i,
          options: f.options || [],
          field_mapping: f.field_mapping || null,
        } as any);
      }
      openBuilder(form);
      toast.success(`Template "${tpl.title}" criado!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este formulário?")) return;
    await remove(id);
    toast.success("Formulário excluído");
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
    toast.success("Link copiado!");
  };

  if (view === "builder" && selectedForm) {
    return (
      <FormBuilder
        form={selectedForm}
        onUpdate={async (id, updates) => {
          await update(id, updates);
          const updated = { ...selectedForm, ...updates } as FormRecord;
          setSelectedForm(updated);
        }}
        onBack={() => { setView("list"); reload(); }}
      />
    );
  }

  if (view === "analytics" && selectedForm) {
    return <FormAnalytics form={selectedForm} onBack={() => setView("list")} />;
  }

  if (loading) {
    return <div className="text-muted-foreground text-center py-12">Carregando formulários...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Formulários</h2>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Novo Form
        </Button>
      </div>

      {/* Templates */}
      {forms.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Comece com um template:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {formTemplates.map((tpl) => (
              <Card
                key={tpl.slug}
                className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition"
                onClick={() => handleUseTemplate(tpl)}
              >
                <CardContent className="pt-4 text-center space-y-1">
                  <FileText className="w-6 h-6 mx-auto text-primary" />
                  <p className="font-medium text-sm">{tpl.title}</p>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Forms list */}
      <div className="space-y-3">
        {forms.map((form) => (
          <Card key={form.id} className="bg-card/50 border-border/50">
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{form.title}</p>
                  <Badge variant={form.status === "published" ? "default" : "secondary"} className="text-[10px]">
                    {form.status === "published" ? "Publicado" : form.status === "draft" ? "Rascunho" : "Arquivado"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Link2 className="w-3 h-3" /> /f/{form.slug}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyLink(form.slug)} title="Copiar link">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAnalytics(form)} title="Analytics">
                  <BarChart3 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openBuilder(form)} title="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(form.id)} title="Excluir">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Formulário</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={newTitle} onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")); }} placeholder="Ex: Agendar Visita" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="ex: agendar-visita" />
              <p className="text-xs text-muted-foreground mt-1">URL: /f/{newSlug || "..."}</p>
            </div>
            <Button className="w-full" onClick={handleCreate}>Criar</Button>

            {formTemplates.length > 0 && (
              <>
                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">ou use um template</span></div></div>
                <div className="grid grid-cols-3 gap-2">
                  {formTemplates.map((tpl) => (
                    <Button key={tpl.slug} variant="outline" size="sm" className="text-xs" onClick={() => { setShowCreateDialog(false); handleUseTemplate(tpl); }}>
                      {tpl.title}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormsModule;
