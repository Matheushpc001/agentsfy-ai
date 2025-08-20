import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function OAuthCallback() {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (error) {
      // Mostrar erro e fechar janela
      document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Erro na autorização</h2>
          <p style="color: #666;">Erro: ${error}</p>
          <p style="margin-top: 20px;">Você pode fechar esta janela.</p>
        </div>
      `;
      return;
    }

    if (code) {
      // Mostrar código para o usuário copiar
      document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto;">
            <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0;">✅ Autorização Concedida!</h2>
              <p style="margin: 0; opacity: 0.9;">Copie o código abaixo e cole na janela principal</p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px dashed #1a73e8;">
              <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">Código de Autorização:</label>
              <input 
                type="text" 
                value="${code}" 
                readonly 
                onclick="this.select()" 
                style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; background: white; text-align: center; font-family: monospace;"
              >
              <button 
                onclick="navigator.clipboard.writeText('${code}'); alert('Código copiado!')" 
                style="margin-top: 10px; padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                📋 Copiar Código
              </button>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; color: #1565c0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Próximos passos:</strong><br>
                1. Copie o código acima (clique para selecionar)<br>
                2. Volte para a janela principal<br>
                3. Cole o código no campo indicado<br>
                4. Clique em "Conectar"
              </p>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              Você pode fechar esta janela após copiar o código.
            </p>
          </div>
        </div>
      `;
    } else {
      // Nenhum código recebido
      document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Erro</h2>
          <p style="color: #666;">Nenhum código de autorização recebido.</p>
          <p style="margin-top: 20px;">Você pode fechar esta janela e tentar novamente.</p>
        </div>
      `;
    }
  }, [location]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Processando autorização...</h2>
      <p>Aguarde um momento...</p>
    </div>
  );
}