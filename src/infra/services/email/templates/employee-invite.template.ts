export interface EmployeeInviteTemplateParams {
  employeeName: string;
  companyName: string;
  inviteLink: string;
  inviterName: string;
  role: string;
}

import {
  escapeHtml,
  renderBaseEmailLayout,
  renderCallout,
  renderMutedText,
  renderPrimaryButton,
} from './base-email.template';

export function getEmployeeInviteTemplate(
  params: EmployeeInviteTemplateParams,
): string {
  const roleNames: Record<string, string> = {
    manager: 'Gerente',
    executor: 'Executor',
    consultant: 'Consultor',
  };

  const roleName = roleNames[params.role] || params.role;

  const employeeName = escapeHtml(params.employeeName);
  const companyName = escapeHtml(params.companyName);
  const inviterName = escapeHtml(params.inviterName);
  const safeRoleName = escapeHtml(roleName);

  const buttonHtml = renderPrimaryButton({
    href: params.inviteLink,
    label: 'Aceitar convite',
  });

  const roleCallout = renderCallout({
    variant: 'info',
    html: `<strong style="color:#1F2937;">Seu cargo:</strong> ${safeRoleName}`,
  });

  const expiresCallout = renderCallout({
    variant: 'warning',
    html: `<strong style="color:#111827;">Importante:</strong> este convite é válido por <strong>7 dias</strong>. Após esse período, será necessário solicitar um novo convite.`,
  });

  const fallbackLink = `
<div style="margin:14px 0 0 0; font-size:13px; line-height:1.6;">
  Se o botão não funcionar, copie e cole este link no navegador:<br />
  <span style="word-break:break-all; color:#4F46E5;">${escapeHtml(params.inviteLink)}</span>
</div>
  `.trim();

  const muted = renderMutedText(
    `Se você não esperava receber este convite ou não conhece <strong>${inviterName}</strong>, pode ignorar este email com segurança.`,
  );

  const bodyHtml = `
<div style="font-size:14px; line-height:1.7;">
  <div style="margin:0 0 10px 0;">Olá, <strong>${employeeName}</strong>!</div>
  <div style="margin:0 0 10px 0;">
    <strong>${inviterName}</strong> convidou você para fazer parte da equipe <strong>${companyName}</strong> na Tooldo.
  </div>
  ${roleCallout}
  <div style="margin:0 0 6px 0;">Para aceitar o convite e definir sua senha de acesso:</div>
  ${buttonHtml}
  ${expiresCallout}
  ${fallbackLink}
  ${muted}
</div>
  `.trim();

  return renderBaseEmailLayout({
    title: `Convite para ${params.companyName}`,
    preheader: `Você foi convidado(a) para entrar em ${params.companyName}.`,
    bodyHtml,
    footerNote: 'Esta é uma mensagem automática; por favor, não responda.',
  });
}

export function getEmployeeInviteText(
  params: EmployeeInviteTemplateParams,
): string {
  const roleNames: Record<string, string> = {
    manager: 'Gerente',
    executor: 'Executor',
    consultant: 'Consultor',
  };
  const roleName = roleNames[params.role] || params.role;

  return [
    `Olá, ${params.employeeName}!`,
    '',
    `${params.inviterName} convidou você para fazer parte da equipe ${params.companyName} na Tooldo.`,
    `Seu cargo: ${roleName}`,
    '',
    'Para aceitar o convite e definir sua senha, acesse:',
    params.inviteLink,
    '',
    'Importante: este convite é válido por 7 dias.',
    '',
    `Se você não esperava receber este convite ou não conhece ${params.inviterName}, ignore este email com segurança.`,
  ].join('\n');
}
