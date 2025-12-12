export interface EmployeeInviteAcceptedTemplateParams {
  employeeName: string;
  companyName: string;
  adminName: string;
}

export function getEmployeeInviteAcceptedTemplate(
  params: EmployeeInviteAcceptedTemplateParams,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite Aceito - ${params.companyName}</title>
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
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      font-weight: 600;
      margin: 10px 0;
    }
    .info-box {
      background-color: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Tooldo</div>
    </div>

    <div style="text-align: center;">
      <h1>✅ Convite Aceito!</h1>
      <span class="success-badge">Novo membro na equipe</span>
    </div>

    <div class="content">
      <p>Olá, <strong>${params.adminName}</strong>!</p>

      <p>
        Temos uma ótima notícia! <strong>${params.employeeName}</strong> aceitou
        o convite para fazer parte de <strong>${params.companyName}</strong>.
      </p>

      <div class="info-box">
        <p style="font-size: 18px; margin: 0;">
          🎉 <strong>${params.employeeName}</strong> agora faz parte da equipe!
        </p>
      </div>

      <p>
        O novo membro já pode acessar a plataforma e começar a trabalhar.
        Você pode gerenciar as permissões e acessos através do painel administrativo.
      </p>
    </div>

    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Tooldo. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
