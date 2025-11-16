export interface EmployeeInviteTemplateParams {
  employeeName: string;
  companyName: string;
  inviteLink: string;
  inviterName: string;
  role: string;
}

export function getEmployeeInviteTemplate(
  params: EmployeeInviteTemplateParams,
): string {
  const roleNames: Record<string, string> = {
    manager: 'Gerente',
    executor: 'Executor',
    consultant: 'Consultor',
  };

  const roleName = roleNames[params.role] || params.role;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para ${params.companyName}</title>
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
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content {
      margin-bottom: 30px;
    }
    .highlight {
      background-color: #f3f4f6;
      padding: 15px;
      border-left: 4px solid #4F46E5;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #4F46E5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .info-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 16px;
      margin: 20px 0;
    }
    .info-box strong {
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Weedu</div>
    </div>

    <h1>🎉 Você foi convidado!</h1>

    <div class="content">
      <p>Olá, <strong>${params.employeeName}</strong>!</p>

      <p>
        <strong>${params.inviterName}</strong> convidou você para fazer parte da equipe
        <strong>${params.companyName}</strong> na plataforma Weedu.
      </p>

      <div class="info-box">
        <strong>📋 Seu cargo:</strong> ${roleName}
      </div>

      <p>
        Clique no botão abaixo para aceitar o convite e criar sua senha de acesso:
      </p>

      <div style="text-align: center;">
        <a href="${params.inviteLink}" class="button">
          Aceitar Convite
        </a>
      </div>

      <div class="highlight">
        <strong>⏰ Importante:</strong> Este convite é válido por 7 dias.
        Após este período, será necessário solicitar um novo convite.
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Se você não esperava receber este convite ou não conhece ${params.inviterName},
        pode ignorar este email com segurança.
      </p>
    </div>

    <div class="footer">
      <p>
        Esta é uma mensagem automática, por favor não responda este email.
      </p>
      <p>
        © ${new Date().getFullYear()} Weedu. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
