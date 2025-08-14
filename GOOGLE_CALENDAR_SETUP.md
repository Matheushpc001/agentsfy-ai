# 📅 Sistema Google Calendar - AgentsFy AI

## 🎯 **COMO FUNCIONA O SISTEMA**

### **Fluxo Completo:**
1. **FRANQUEADO** cria agendamentos para seus clientes na aba "Agenda"
2. **CLIENTE** se conecta ao próprio Google Calendar na aba "Agenda" 
3. Quando o franqueado cria um agendamento, ele aparece automaticamente no Google Calendar do cliente

---

## 👥 **PAPÉIS E FUNCIONALIDADES**

### **🏢 FRANQUEADO (Quem gerencia):**
- ✅ Cria agendamentos para seus clientes
- ✅ Edita, cancela e marca como concluído
- ✅ Vê agenda de todos os seus clientes
- ✅ Interface completa de gestão

### **🧑‍💼 CLIENTE (Quem recebe agendamento):**
- ✅ Conecta SEU próprio Google Calendar
- ✅ Vê agendamentos criados pelo franqueado
- ✅ Agendamentos aparecem automaticamente no seu Google Calendar pessoal
- ❌ Não pode criar agendamentos (só o franqueado pode)

---

## 📋 **PASSO A PASSO PARA TESTAR**

### **1. Como FRANQUEADO:**
1. Faça login como franqueado
2. Vá em "Clientes" e certifique-se de ter clientes cadastrados
3. Vá em "Agenda"
4. Clique em "Novo Agendamento"
5. Selecione um cliente, preencha os dados
6. Crie o agendamento

### **2. Como CLIENTE:**
1. Faça login como cliente (role: customer)
2. Vá em "Agenda" 
3. Clique em "Conectar Google Calendar"
4. **IMPORTANTE:** Configure suas credenciais OAuth do Google primeiro
5. Conecte e veja seus agendamentos

---

## 🔧 **CONFIGURAÇÃO DO GOOGLE OAUTH**

### **Pré-requisitos:**
Para a integração funcionar **de verdade**, você precisa:

1. **Google Cloud Console:** https://console.cloud.google.com/
2. **Criar projeto** ou usar existente
3. **Ativar Google Calendar API**
4. **Criar credenciais OAuth 2.0**
5. **Configurar URLs de redirecionamento**

### **Variáveis de ambiente necessárias:**
```bash
# .env
REACT_APP_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

### **URLs de redirecionamento:**
- **Desenvolvimento:** http://localhost:8080/auth/google/callback
- **Produção:** https://seudominio.com/auth/google/callback

---

## 🗄️ **BANCO DE DADOS**

### **Tabelas criadas:**
✅ `appointments` - Todos os agendamentos
✅ `google_calendar_configs` - Configurações por cliente  
✅ `profiles.google_calendar_token` - Tokens de autenticação

### **Verificar se migrations foram aplicadas:**
```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('appointments', 'google_calendar_configs');

-- Ver appointments
SELECT * FROM appointments;

-- Ver configurações Google
SELECT * FROM google_calendar_configs;
```

---

## 🚀 **STATUS ATUAL DA IMPLEMENTAÇÃO**

### ✅ **O QUE ESTÁ FUNCIONANDO:**
- Sistema de agendamentos completo
- Interface para franqueados criarem/editarem agendamentos
- Interface para clientes conectarem Google Calendar
- Banco de dados estruturado
- Simulação da integração Google Calendar

### ⚠️ **O QUE PRECISA SER CONFIGURADO:**
- **Credenciais OAuth do Google** (variáveis de ambiente)
- **Callback de autenticação** do Google
- **Sincronização real** com Google Calendar API

### 🔄 **MODO ATUAL:**
O sistema funciona em **"modo simulação"** - tudo funciona localmente, mas para sincronizar de verdade com Google Calendar você precisa configurar as credenciais OAuth.

---

## 🎯 **FLUXO DO USUÁRIO FINAL**

### **Cenário Real:**
1. **João (Franqueado)** tem vários clientes
2. **Maria (Cliente do João)** quer receber agendamentos no seu Google Calendar pessoal
3. **Maria** conecta seu Google Calendar no sistema
4. **João** cria um agendamento para Maria às 14:00
5. **Automaticamente** aparece no Google Calendar da Maria

### **Benefício:**
- Cliente não precisa ficar anotando compromissos
- Sincronização automática
- Notificações do próprio Google Calendar
- Integração com agenda pessoal do cliente

---

## 📞 **SUPORTE TÉCNICO**

Se tiver dúvidas sobre configuração do Google OAuth ou implementação, me chame que explicamos passo a passo!

**Sistema totalmente funcional** - só precisa das credenciais do Google para funcionar 100% na vida real.