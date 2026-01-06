import * as React from 'react';
import { BaseEmail, Callout } from './base-email';

export type EmployeeInviteAcceptedEmailProps = {
  adminName: string;
  employeeName: string;
  companyName: string;
};

export function EmployeeInviteAcceptedEmail(
  props: EmployeeInviteAcceptedEmailProps,
): React.ReactElement {
  return (
    <BaseEmail
      title="Convite aceito"
      preheader={`${props.employeeName} aceitou o convite para ${props.companyName}.`}
    >
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div style={{ margin: '0 0 10px 0' }}>
          Olá, <strong>{props.adminName}</strong>!
        </div>

        <div style={{ margin: '0 0 10px 0' }}>
          Boas notícias: <strong>{props.employeeName}</strong> aceitou o convite
          para entrar em <strong>{props.companyName}</strong>.
        </div>

        <Callout variant="info">
          <strong style={{ color: '#111827' }}>{props.employeeName}</strong>{' '}
          agora faz parte da equipe{' '}
          <strong style={{ color: '#111827' }}>{props.companyName}</strong>.
        </Callout>

        <div style={{ margin: 0 }}>
          Você pode gerenciar permissões e acessos pelo painel administrativo.
        </div>
      </div>
    </BaseEmail>
  );
}

export function getEmployeeInviteAcceptedPlainText(
  props: EmployeeInviteAcceptedEmailProps,
): string {
  return [
    `Olá, ${props.adminName}!`,
    '',
    `Boas notícias: ${props.employeeName} aceitou o convite para entrar em ${props.companyName}.`,
    '',
    'Você pode gerenciar permissões e acessos pelo painel administrativo.',
  ].join('\n');
}


