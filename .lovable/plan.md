

# Forms Module — Plano de Implementação

## Visão Geral

Criar um módulo **Forms** completo no painel admin, com formulários dinâmicos (estilo Typeform/Inlead), integração direta com o CRM existente, links compartilháveis com slug, analytics por formulário, e templates prontos para o ICP do Ellite Coworking.

## Correção Imediata

Antes de tudo, corrigir o build error: adicionar `import CRMModule from "@/components/crm/CRMModule"` corretamente no `Admin.tsx` (já existe na linha 15, mas o componente pode não estar sendo encontrado — verificar e corrigir).

## Arquitetura do Banco de Dados (3 tabelas novas)

**`forms`** — Definição do formulário
- `id`, `title`, `slug` (unique), `description`, `pipeline_id` (FK → crm_pipelines), `stage_id` (FK → crm_stages para onde o lead entra), `status` (draft/published/archived), `theme_config` (jsonb — cores, logo, bg), `settings` (jsonb — redirect URL, notifications, etc), `created_by`, `created_at`, `updated_at`

**`form_fields`** — Campos dinâmicos do formulário
- `id`, `form_id` (FK → forms), `type` (text/email/phone/select/rating/textarea/number/date/yes_no/file_upload/opinion_scale), `label`, `placeholder`, `required`, `position`, `options` (jsonb — para selects/radios), `validation` (jsonb — min, max, regex), `conditional_logic` (jsonb — mostrar/ocultar baseado em respostas anteriores), `field_mapping` (text — mapeia para campo do CRM: name/email/phone/company/source/notes)

**`form_submissions`** — Respostas recebidas
- `id`, `form_id` (FK → forms), `lead_id` (FK nullable → crm_leads), `data` (jsonb — respostas), `metadata` (jsonb — IP, user_agent, UTMs, referrer, tempo de preenchimento), `started_at`, `completed_at`, `dropped_at_field` (text — para analytics de abandono), `created_at`

**RLS**: Anon pode INSERT em submissions e SELECT forms/fields publicados. Authenticated tem acesso total.

## Componentes a Criar

### 1. Rota pública: `/f/:slug`
- `src/pages/FormPublic.tsx` — Renderiza o formulário estilo Typeform (uma pergunta por vez, transições animadas, barra de progresso)
- Sem navbar, full-screen, responsivo
- Ao submeter: cria lead no CRM automaticamente (pipeline + stage configurados) e registra submission

### 2. Módulo Admin: `src/components/forms/`

- **`FormsModule.tsx`** — Listagem de forms com stats rápidas (submissions, taxa de conclusão)
- **`FormBuilder.tsx`** — Editor drag-and-drop dos campos, preview ao vivo, configurações de tema e integração CRM (escolher pipeline/stage)
- **`FormFieldEditor.tsx`** — Configuração individual de cada campo (tipo, validação, lógica condicional, mapeamento CRM)
- **`FormAnalytics.tsx`** — KPIs por form: total de views, starts, completions, taxa de conversão, abandono por campo, tempo médio, UTM sources
- **`FormTemplates.tsx`** — Templates pré-configurados para o ICP:
  - "Agendar Visita" (Nome, WhatsApp, Profissão, Dias/semana, Mensagem)
  - "Tour Virtual" (Nome, Email, Interesse)
  - "Contato Rápido" (Nome, WhatsApp)

### 3. Hook: `src/hooks/useForms.ts`
- CRUD de forms, fields, submissions
- Realtime para submissions novas

## Funcionalidades Avançadas

| Feature | Detalhe |
|---------|---------|
| **Lógica condicional** | Campo X aparece somente se campo Y = valor Z |
| **Mapeamento CRM** | Cada campo mapeia para um campo do lead (name, email, phone, company, source, notes, opportunity_value) |
| **Temas** | Cor primária, cor de fundo, logo, modo claro/escuro |
| **Analytics de abandono** | Rastreia em qual campo o usuário parou |
| **Tempo de preenchimento** | started_at vs completed_at |
| **UTM tracking** | Captura UTMs da URL do form automaticamente |
| **Slug customizável** | Ex: `/f/agendar-visita` |
| **Thank you page** | Mensagem customizada ou redirect |
| **Multi-step** | Uma pergunta por tela com animação (estilo Typeform) |

## Integração com Admin

- Adicionar tab "Forms" no `AdminSidebar.tsx` (ícone: `FileText`)
- Atualizar `AdminTab` type e `Admin.tsx` para renderizar o módulo
- Adicionar rota `/f/:slug` no `App.tsx`

## Estimativa de Arquivos

```text
Novos:
  src/pages/FormPublic.tsx
  src/components/forms/FormsModule.tsx
  src/components/forms/FormBuilder.tsx
  src/components/forms/FormFieldEditor.tsx
  src/components/forms/FormAnalytics.tsx
  src/components/forms/FormTemplates.tsx
  src/hooks/useForms.ts
  supabase/migrations/xxx_forms_tables.sql

Editados:
  src/App.tsx (nova rota /f/:slug)
  src/components/admin/AdminSidebar.tsx (tab Forms)
  src/pages/Admin.tsx (fix build + render FormsModule)
```

