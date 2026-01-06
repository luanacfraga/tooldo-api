export interface EmployeeInviteAcceptedTemplateParams {
  employeeName: string;
  companyName: string;
  adminName: string;
}

import {
  escapeHtml,
  renderBaseEmailLayout,
  renderCallout,
} from './base-email.template';

export function getEmployeeInviteAcceptedTemplate(
  params: EmployeeInviteAcceptedTemplateParams,
): string {
  const adminName = escapeHtml(params.adminName);
  const employeeName = escapeHtml(params.employeeName);
  const companyName = escapeHtml(params.companyName);

  const callout = renderCallout({
    variant: 'info',
    html: `<strong style="color:#111827;">${employeeName}</strong> agora faz parte da equipe <strong style="color:#111827;">${companyName}</strong>.`,
  });

  const bodyHtml = `
<div style="font-size:14px; line-height:1.7;">
  <div style="margin:0 0 10px 0;">Olá, <strong>${adminName}</strong>!</div>
  <div style="margin:0 0 10px 0;">
    Boas notícias: <strong>${employeeName}</strong> aceitou o convite para entrar em <strong>${companyName}</strong>.
  </div>
  ${callout}
  <div style="margin:0;">
    O novo membro já pode acessar a plataforma. Você pode gerenciar permissões e acessos pelo painel administrativo.
  </div>
</div>
  `.trim();

  return renderBaseEmailLayout({
    title: 'Convite aceito',
    preheader: `${params.employeeName} aceitou o convite para ${params.companyName}.`,
    bodyHtml,
  });
}

export function getEmployeeInviteAcceptedText(
  params: EmployeeInviteAcceptedTemplateParams,
): string {
  return [
    `Olá, ${params.adminName}!`,
    '',
    `Boas notícias: ${params.employeeName} aceitou o convite para entrar em ${params.companyName}.`,
    '',
    'Você pode gerenciar permissões e acessos pelo painel administrativo.',
  ].join('\n');
}
