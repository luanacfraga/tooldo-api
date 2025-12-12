export interface PasswordResetTemplateParams {
  userName: string;
  resetLink: string;
}

export function getPasswordResetTemplate(
  params: PasswordResetTemplateParams,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Tooldo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #6B7280;
      text-align: center;
    }
    .warning {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Tooldo</div>
    </div>
    
    <h1 class="title">Recuperação de Senha</h1>
    
    <div class="content">
      <p>Olá, ${params.userName}!</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, pode ignorar este email.</p>
      
      <p>Para redefinir sua senha, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="${params.resetLink}" class="button">Redefinir Senha</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Importante:</strong> Este link expira em 1 hora por motivos de segurança.
      </div>
      
      <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
      <p style="word-break: break-all; color: #4F46E5; font-size: 12px;">${params.resetLink}</p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>&copy; ${new Date().getFullYear()} Tooldo. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
}
