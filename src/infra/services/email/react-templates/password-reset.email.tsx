import * as React from 'react';
import {
  BaseEmail,
  Callout,
  FallbackLink,
  MutedText,
  PrimaryButton,
} from './base-email';

export type PasswordResetEmailProps = {
  userName: string;
  resetLink: string;
};

export function PasswordResetEmail(
  props: PasswordResetEmailProps,
): React.ReactElement {
  return (
    <BaseEmail
      title="Recuperação de senha"
      preheader="Use este email para redefinir sua senha. O link expira em 1 hora."
      footerNote="Esta é uma mensagem automática; por favor, não responda."
    >
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div style={{ margin: '0 0 10px 0' }}>
          Olá, <strong>{props.userName}</strong>!
        </div>

        <div style={{ margin: '0 0 10px 0' }}>
          Recebemos uma solicitação para redefinir a senha da sua conta.
        </div>

        <div style={{ margin: '0 0 6px 0' }}>Para continuar:</div>

        <PrimaryButton href={props.resetLink} label="Redefinir senha" />

        <Callout variant="warning">
          <strong style={{ color: '#111827' }}>Importante:</strong> este link
          expira em <strong>1 hora</strong> por motivos de segurança.
        </Callout>

        <FallbackLink url={props.resetLink} />

        <MutedText>
          Se você não solicitou a redefinição de senha, pode ignorar este email
          com segurança.
        </MutedText>
      </div>
    </BaseEmail>
  );
}

export function getPasswordResetPlainText(props: PasswordResetEmailProps): string {
  return [
    `Olá, ${props.userName}!`,
    '',
    'Recebemos uma solicitação para redefinir a senha da sua conta.',
    'Para continuar, acesse o link abaixo:',
    props.resetLink,
    '',
    'Importante: este link expira em 1 hora.',
    '',
    'Se você não solicitou a redefinição de senha, ignore este email com segurança.',
  ].join('\n');
}


