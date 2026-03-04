# 🟡 FASE 1 - Estrutura Administrativa Sólida

## Objetivo
Criar base organizacional robusta com gestão centralizada de usuários, responsáveis, notificações e auditoria.

---

## 📋 Tarefas da FASE 1

### 1. Gestão de Usuários Expandida
**Arquivo:** `app/(app)/admin/users/page.tsx`

Recursos a adicionar:
- [ ] Listar usuários com paginação
- [ ] Filtrar por role e status online
- [ ] Buscar por email/nome
- [ ] Mudar role com confirmação
- [ ] Deletar usuário (apenas admin) com log
- [ ] Ver último login e última atividade
- [ ] Resetar senha (enviar email)
- [ ] Desativar/Ativar usuário

**Tabela de Usuários:**
```
UID | Email | Nome | Role | Status | Último Login | Ações
```

---

### 2. Gestão de Responsáveis Técnicos
**Arquivo:** `app/(app)/admin/responsaveis/page.tsx` (NOVO)

Criar gestão de responsáveis (RT, Engenheiros, Mestres, etc):

**Campos:**
- Nome (obrigatório)
- Cargo (RT, Engenheiro, Mestre, Arquiteto, Fiscal, Outro)
- CREA (número - opcional)
- Telefone (opcional)
- Email (opcional)
- Associar a usuário (link a um user do sistema)

**Funcionalidades:**
- Listar com filtro por cargo
- Criar novo responsável
- Editar responsável
- Deletar responsável
- Exportar CSV

---

### 3. Dashboard Admin Expandido
**Arquivo:** `app/(app)/admin/page.tsx`

Adicionar cards com estatísticas:
- Total de usuários
- Usuários online agora
- Últimas ações (últimos 5 logs)
- Notificações enviadas (este mês)
- Responsáveis cadastrados
- Taxa de conformidade de vistorias

---

### 4. Notificações Globais Melhoradas
**Arquivo:** `app/(app)/admin/notifications/page.tsx`

Melhorias:
- [ ] Criar notificação com preview
- [ ] Agendamento (enviar agora vs. agendar)
- [ ] Destinatários (todos / apenas admins / grupo específico)
- [ ] Histórico com status de leitura
- [ ] Reenviar notificação
- [ ] Análise: quantos leram, quem não leu

---

### 5. Página de Auditoria e Compliance
**Arquivo:** `app/(app)/admin/audit/page.tsx` (NOVO)

Recursos:
- [ ] Validar integridade de logs
- [ ] Mostrar tentativas de acesso não autorizado
- [ ] Relatório de atividades por usuário
- [ ] Filtrar por tipo de ação
- [ ] Exportar logs para análise
- [ ] Alert de padrões suspeitos

**Verificações:**
```
✓ Cadeia de logs íntegra?
✓ Tentativas de login falhadas?
✓ Promoções de admin?
✓ Deletions?
✓ IP addresses anormais?
```

---

### 6. Melhorias de UI/UX
**Componentes a criar:**

1. **AdminTable** (`components/AdminTable.tsx`)
   - Tabela reutilizável com paginação
   - Sorting por coluna
   - Filtros
   - Actions (editar, deletar, etc)

2. **AdminCard** (`components/AdminCard.tsx`)
   - Card padrão para statísticas
   - Ícone + número + label
   - Status color (verde/amarelo/vermelho)

3. **AdminForm** (`components/AdminForm.tsx`)
   - Formulário reutilizável
   - Validação com Zod
   - Submit e cancel buttons

---

## 📊 Estado Esperado após FASE 1

**Painel Admin = Headquarters da Aplicação**

```
/admin
├── Dashboard           ← Visão geral de tudo
├── Usuários           ← Gestão de pessoas
├── Responsáveis       ← Gestão de técnicos/engenheiros
├── Notificações       ← Comunicação
├── Logs               ← Auditoria (atual)
├── Audit              ← Compliance
├── Configurações      ← Sistema (atual)
└── Chat Moderadores   ← Comunicação (atual)
```

---

## 🔄 Fluxos Principais

### Fluxo: Criar Usuário Admin
1. Admin vai em `/admin/users`
2. Clica "Novo Usuário"
3. Insere email
4. Sistema envia convite
5. Novo usuário clica link
6. Cria senha
7. Admin promove a role desejada
8. Log criado automaticamente

### Fluxo: Criar Notificação
1. Admin vai em `/admin/notifications`
2. Escreve título + mensagem
3. Seleciona tipo (info/warning/success/alert)
4. Preview antes de enviar
5. Clica "Enviar"
6. Notificação aparece em tempo real em todas as telas
7. Sistema registra quem leu

### Fluxo: Auditar Sistema
1. Admin vai em `/admin/audit`
2. Clica "Validar Integridade"
3. Sistema verifica hash chain
4. Resultado: "OK" ou "TAMPEROVA DETECTADA"
5. Se problema: alerta em vermelho com detalhes

---

## 🛡️ Segurança em FASE 1

- ✅ Todas ações precisam ser admin/dev
- ✅ Validação server-side obrigatória
- ✅ Rate limiting em operações críticas
- ✅ Logs de tudo (criação, edição, deleção)
- ✅ Confirmação em operações destrutivas
- ✅ IP address registrado em logs de admin
- ✅ Auditoria contínua de integridade

---

## 📝 Próximas Fases

**FASE 2:** Reestruturação de Vistorias (checklist por escopo)
**FASE 3:** Geração de PDF profissional
**FASE 4:** Comunicação interna em tempo real
**FASE 5:** Animações profissionais
**FASE 6:** Otimização e escalabilidade
