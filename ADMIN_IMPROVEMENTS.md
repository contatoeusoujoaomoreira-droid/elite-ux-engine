# Melhorias do Painel Admin - Elite Coworking Page

## 📋 Resumo das Implementações

Este documento descreve as melhorias implementadas no painel administrativo do Elite Coworking Page, incluindo filtros de analytics, rastreamento de eventos e gestão de usuários.

---

## 🎯 1. Filtros de Período nos Analytics (KPIs)

### Implementação
- **Componente:** `DateRangeFilter.tsx`
- **Funcionalidade:** Permite filtrar dados por período predefinido ou personalizado
- **Opções Disponíveis:**
  - Hoje
  - Ontem
  - Esta Semana
  - Este Mês
  - Personalizado (seleção de data inicial e final)

### Como Funciona
1. O usuário seleciona um período no filtro
2. As datas são passadas para o componente `Admin.tsx`
3. Todas as queries ao Supabase são ajustadas com `.gte("created_at", startISO)` e `.lte("created_at", endISO)`
4. Os KPIs, gráficos e tabelas são atualizados automaticamente

### Dados Filtrados
- **Pageviews Totais:** Contagem de visualizações no período
- **Visitantes Únicos:** Contagem de sessões únicas
- **Taxa de Conversão:** Cliques em planos / Pageviews
- **Gráfico de Pageviews:** Dados diários do período selecionado
- **Tabela de Tráfego:** Origem do tráfego (UTM, Referrer)
- **Heatmap de Cliques:** Cliques por plano no período

---

## 📡 2. Envio de Eventos para Meta Pixel e Google Analytics

### Problema Diagnosticado
O sistema injetava os scripts de Meta Pixel e Google Analytics, mas **não disparava eventos de conversão** além do PageView padrão. Isso significava que:
- Cliques em planos não eram rastreados nas plataformas externas
- Dados de conversão não apareciam no Facebook Ads Manager ou Google Analytics
- Relatórios de ROI estavam incompletos

### Solução Implementada

#### Novo Hook: `useEventForwarder.ts`
Fornece funções para encaminhar eventos para múltiplas plataformas:

```typescript
forwardEventToPixels({
  eventName: "Lead",
  eventData: {
    content_name: "Plan: Hora",
    content_type: "product",
    content_id: "plan_hora",
  },
});
```

**Eventos Suportados:**
- `ViewContent` - Visualização de conteúdo
- `AddToCart` - Adição ao carrinho
- `Purchase` - Compra realizada
- `Lead` - Lead gerado (usado para cliques em planos)
- `CompleteRegistration` - Registro completo
- `Contact` - Contato realizado
- `CustomEvent` - Evento customizado

#### Integração com Rastreamento Existente

**1. Pageview Forwarding** (`useTracker.ts`)
```typescript
forwardEventToPixels({
  eventName: "PageView",
  eventData: {
    page_path: window.location.pathname,
    page_title: document.title,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  },
});
```

**2. Plan Click Forwarding** (`useTracker.ts`)
```typescript
forwardEventToPixels({
  eventName: "Lead",
  eventData: {
    content_name: `Plan: ${planName}`,
    content_type: "product",
    content_id: planName,
    source: "plan_click",
  },
});
```

#### Plataformas Suportadas

| Plataforma | Função | Status |
|-----------|--------|--------|
| Meta Pixel | `window.fbq()` | ✅ Implementado |
| Google Analytics | `window.gtag()` | ✅ Implementado |
| Google Tag Manager | `window.dataLayer.push()` | ✅ Implementado |

### Novo Componente: `EventTrackingStatus.tsx`
Exibe o status de cada rastreador em tempo real:
- ✅ Meta Pixel (Facebook)
- ✅ Google Analytics
- ✅ Google Tag Manager
- ✅ Event Forwarding

---

## 👥 3. Gestão de Usuários Administrativos

### Nova Tabela: `admin_users`
Armazena informações de usuários administrativos com controle de acesso:

```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT ('viewer', 'editor', 'admin'),
  status TEXT ('active', 'inactive', 'pending'),
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Funções de Acesso (Roles)
- **Viewer:** Apenas visualização de dados e relatórios
- **Editor:** Pode editar configurações e pixels
- **Admin:** Acesso total, incluindo gestão de usuários

### Novo Componente: `UserManagement.tsx`
Interface completa para gerenciar usuários administrativos:

**Funcionalidades:**
- ✅ Listar todos os usuários
- ✅ Adicionar novo usuário (cria conta no Supabase Auth)
- ✅ Editar informações do usuário
- ✅ Remover usuário
- ✅ Visualizar último acesso
- ✅ Gerenciar função (role) de cada usuário

**Campos Exibidos:**
- Email
- Nome Completo
- Função (Visualizador/Editor/Admin)
- Status (Ativo/Inativo)
- Último Acesso

### Row-Level Security (RLS)
Políticas implementadas para controle de acesso:
- Apenas usuários autenticados podem ler dados
- Apenas admins podem criar/editar/deletar usuários
- Cada usuário pode ver seu próprio histórico de atividades

---

## 🎨 4. Melhorias Visuais

### Novo Componente: `AnalyticsOverview.tsx`
Dashboard visual aprimorado com cards de KPI:
- Exibição em grid responsivo (2-4 colunas)
- Indicadores de tendência (↑/↓)
- Variação percentual em relação ao período anterior
- Ícones e cores diferenciadas por métrica

### Layout Reorganizado
Ordem de exibição no painel admin:
1. **Filtro de Período** - Seleção de data
2. **Status de Rastreamento** - Verificação de pixels ativos
3. **Overview de Analytics** - Cards de KPI com tendências
4. **Gráfico de Pageviews** - Visualização temporal
5. **Tabela de Tráfego** - Origem do tráfego
6. **Heatmap de Cliques** - Distribuição por plano
7. **Gestão de Usuários** - Controle de acesso
8. **Gestão de Pixels** - Configuração de rastreadores

---

## 🔧 Configuração e Uso

### 1. Configurar Meta Pixel
1. Ir para "Gestão de Pixels & Scripts"
2. Inserir ID do Pixel Meta (apenas números)
3. Clicar em "Testar Pixel"
4. Confirmar que o pixel está válido

### 2. Configurar Google Analytics/GTM
1. Ir para "Gestão de Pixels & Scripts"
2. Inserir ID do Google (GTM-xxx, G-xxx ou AW-xxx)
3. Clicar em "Testar Tag"
4. Confirmar que a tag está válida

### 3. Adicionar Novo Usuário
1. Clicar em "Adicionar Usuário"
2. Preencher email, nome e função
3. Clicar em "Adicionar"
4. Usuário receberá convite para configurar senha

### 4. Filtrar Analytics
1. Selecionar período desejado (Hoje, Semana, Mês, etc.)
2. Ou selecionar datas personalizadas
3. Dados são atualizados automaticamente

---

## 📊 Dados Rastreados

### Pageviews
- `session_id` - ID da sessão
- `page_path` - Caminho da página
- `referrer` - Origem do tráfego
- `utm_source` - Fonte UTM
- `utm_medium` - Meio UTM
- `utm_campaign` - Campanha UTM
- `utm_term` - Termo UTM
- `utm_content` - Conteúdo UTM
- `user_agent` - Navegador/Dispositivo

### Plan Clicks
- `plan_name` - Nome do plano clicado
- `session_id` - ID da sessão
- `created_at` - Data/hora do clique

### Admin Activity Logs
- `admin_user_id` - Usuário que realizou ação
- `action` - Tipo de ação
- `entity_type` - Tipo de entidade
- `entity_id` - ID da entidade
- `changes` - Alterações realizadas (JSON)
- `ip_address` - IP do usuário
- `user_agent` - Navegador/Dispositivo

---

## 🚀 Próximas Melhorias Sugeridas

1. **Relatórios Avançados**
   - Exportar dados em CSV/PDF
   - Gráficos comparativos de períodos
   - Análise de funil de conversão

2. **Automações**
   - Enviar relatórios por email
   - Alertas de anomalias
   - Webhooks para integrações

3. **Segurança**
   - Autenticação de dois fatores (2FA)
   - Logs de auditoria detalhados
   - Backup automático de dados

4. **Integrações**
   - Sincronização com CRM
   - Integração com Slack
   - Webhook para eventos customizados

---

## 📝 Notas Técnicas

### Dependências Adicionadas
- `date-fns` - Manipulação de datas

### Componentes Criados
- `DateRangeFilter.tsx` - Filtro de período
- `AnalyticsOverview.tsx` - Overview visual
- `EventTrackingStatus.tsx` - Status de rastreamento
- `UserManagement.tsx` - Gestão de usuários

### Hooks Criados
- `useEventForwarder.ts` - Encaminhamento de eventos

### Migrations Criadas
- `20260330_add_admin_users.sql` - Tabelas de usuários e logs

---

## 🐛 Troubleshooting

### Pixels não estão sendo rastreados
1. Verificar se os scripts estão carregando (aba Network do DevTools)
2. Confirmar IDs dos pixels no painel admin
3. Verificar console para erros de JavaScript
4. Testar pixels usando o botão "Testar" no painel

### Usuários não conseguem fazer login
1. Verificar se o usuário está com status "active"
2. Confirmar que o email está correto
3. Verificar políticas de RLS no Supabase

### Dados não aparecem no período selecionado
1. Confirmar que há dados nesse período
2. Verificar timezone do servidor
3. Limpar cache do navegador

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Supabase: https://supabase.com/docs
- Documentação do Meta Pixel: https://developers.facebook.com/docs/facebook-pixel
- Documentação do Google Analytics: https://developers.google.com/analytics
