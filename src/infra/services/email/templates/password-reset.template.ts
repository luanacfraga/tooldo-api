export interface PasswordResetTemplateParams {
  userName: string;
  resetLink: string;
}

import {
  escapeHtml,
  renderBaseEmailLayout,
  renderCallout,
  renderMutedText,
  renderPrimaryButton,
} from './base-email.template';

export function getPasswordResetTemplate(
  params: PasswordResetTemplateParams,
): string {
  const userName = escapeHtml(params.userName);

  const buttonHtml = renderPrimaryButton({
    href: params.resetLink,
    label: 'Redefinir senha',
  });

  const warning = renderCallout({
    variant: 'warning',
    html: `<strong style="color:#111827;">Importante:</strong> este link expira em <strong>1 hora</strong> por motivos de segurança.`,
  });

  const fallbackLink = `
<div style="margin:14px 0 0 0; font-size:13px; line-height:1.6;">
  Se o botão não funcionar, copie e cole este link no navegador:<br />
  <span style="word-break:break-all; color:#4F46E5;">${escapeHtml(params.resetLink)}</span>
</div>
  `.trim();

  const muted = renderMutedText(
    'Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.',
  );

  const bodyHtml = `
<div style="font-size:14px; line-height:1.7;">
  <div style="margin:0 0 10px 0;">Olá, <strong>${userName}</strong>!</div>
  <div style="margin:0 0 10px 0;">
    Recebemos uma solicitação para redefinir a senha da sua conta.
  </div>
  <div style="margin:0 0 6px 0;">Para continuar:</div>
  ${buttonHtml}
  ${warning}
  ${fallbackLink}
  ${muted}
</div>
  `.trim();

  return renderBaseEmailLayout({
    title: 'Recuperação de senha',
    preheader:
      'Use este email para redefinir sua senha. O link expira em 1 hora.',
    bodyHtml,
    footerNote: 'Esta é uma mensagem automática; por favor, não responda.',
  });
}

export function getPasswordResetText(
  params: PasswordResetTemplateParams,
): string {
  return [
    `Olá, ${params.userName}!`,
    '',
    'Recebemos uma solicitação para redefinir a senha da sua conta.',
    'Para continuar, acesse o link abaixo:',
    params.resetLink,
    '',
    'Importante: este link expira em 1 hora.',
    '',
    'Se você não solicitou a redefinição de senha, ignore este email com segurança.',
  ].join('\n');
}
