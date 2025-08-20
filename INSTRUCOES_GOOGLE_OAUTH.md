# 🚀 Instruções Imediatas - Google OAuth

## ⚠️ AÇÃO OBRIGATÓRIA AGORA!

Para que o Google Calendar funcione em produção (`https://agentsfy-ai.lovable.app`), você precisa:

### 📋 **Passo a Passo:**

1. **Acesse:** https://console.cloud.google.com/apis/credentials

2. **Procure pelo Client ID:**
   ```
   98233404583-nl4nicefn19jic2877vsge2hdj43qvqp.apps.googleusercontent.com
   ```

3. **Clique no ícone de lápis** (Edit) ao lado do Client ID

4. **Encontre a seção "Authorized redirect URIs"**

5. **ADICIONE estas URLs exatas:**
   ```
   https://agentsfy-ai.lovable.app/oauth/callback
   http://localhost:8080/oauth/callback
   http://localhost:8081/oauth/callback
   http://localhost:8082/oauth/callback
   http://localhost:8083/oauth/callback
   http://localhost:8084/oauth/callback
   http://localhost:8085/oauth/callback
   ```

6. **Clique em "SAVE"**

## 🎯 **Por que isso é necessário?**

- A primeira URL (`https://agentsfy-ai.lovable.app/oauth/callback`) é para sua aplicação em **PRODUÇÃO**
- As URLs localhost são para **DESENVOLVIMENTO** local
- Sem isso, o Google rejeita a autenticação com erro `redirect_uri_mismatch`

## ✅ **Como testar após configurar:**

1. Acesse: https://agentsfy-ai.lovable.app/franchisee/schedule
2. Clique em "Abrir Autorização Google"
3. Deve abrir janela do Google sem erro
4. Autorize e copie o código
5. Cole no campo e conecte

## 🚨 **Status Atual:**
- ❌ **Não funciona** - URLs não configuradas no Google
- ⏱️ **Aguardando** - Você adicionar as URLs
- ✅ **Funcionará** - Após você salvar no Google Cloud Console

**Tempo estimado:** 2-3 minutos para configurar