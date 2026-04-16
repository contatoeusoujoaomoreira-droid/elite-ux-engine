export interface FormTemplate {
  title: string;
  slug: string;
  description: string;
  fields: {
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    field_mapping?: string;
    options?: any[];
  }[];
}

export const formTemplates: FormTemplate[] = [
  {
    title: "Agendar Visita",
    slug: "agendar-visita",
    description: "Formulário para agendamento de visita ao Ellite Coworking",
    fields: [
      { type: "text", label: "Qual é o seu nome?", placeholder: "Nome completo", required: true, field_mapping: "name" },
      { type: "phone", label: "Seu WhatsApp", placeholder: "(11) 99999-9999", required: true, field_mapping: "phone" },
      { type: "email", label: "Seu melhor e-mail", placeholder: "email@exemplo.com", required: false, field_mapping: "email" },
      { type: "text", label: "Qual sua profissão?", placeholder: "Ex: Advogado, Designer...", required: false, field_mapping: "company" },
      { type: "select", label: "Quantos dias por semana pretende usar?", required: true, options: [
        { label: "1-2 dias", value: "1-2" },
        { label: "3-4 dias", value: "3-4" },
        { label: "Todos os dias", value: "5+" },
      ]},
      { type: "textarea", label: "Deixe uma mensagem (opcional)", placeholder: "Conte o que precisa...", required: false, field_mapping: "notes" },
    ],
  },
  {
    title: "Tour Virtual",
    slug: "tour-virtual",
    description: "Solicitar tour virtual do espaço",
    fields: [
      { type: "text", label: "Seu nome", placeholder: "Nome completo", required: true, field_mapping: "name" },
      { type: "email", label: "E-mail para envio do tour", placeholder: "email@exemplo.com", required: true, field_mapping: "email" },
      { type: "select", label: "O que mais te interessa?", required: true, options: [
        { label: "Estações de trabalho", value: "estacoes" },
        { label: "Salas de reunião", value: "reuniao" },
        { label: "Área de convivência", value: "convivencia" },
        { label: "Tudo!", value: "tudo" },
      ]},
    ],
  },
  {
    title: "Contato Rápido",
    slug: "contato-rapido",
    description: "Formulário rápido de contato via WhatsApp",
    fields: [
      { type: "text", label: "Como podemos te chamar?", placeholder: "Seu nome", required: true, field_mapping: "name" },
      { type: "phone", label: "WhatsApp para contato", placeholder: "(11) 99999-9999", required: true, field_mapping: "phone" },
    ],
  },
];
