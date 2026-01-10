import * as React from 'react';
import {
  BaseEmail,
  Callout,
  FallbackLink,
  MutedText,
  PrimaryButton,
} from './base-email';

export type EmployeeInviteEmailProps = {
  employeeName: string;
  companyName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
};

export function EmployeeInviteEmail(
  props: EmployeeInviteEmailProps,
): React.ReactElement {
  const roleNames: Record<string, string> = {
    manager: 'Gerente',
    executor: 'Executor',
    consultant: 'Consultor',
  };
  const roleName = roleNames[props.role] || props.role;

  return (
    <BaseEmail
      title={`Convite para ${props.companyName}`}
      preheader={`Você foi convidado(a) para entrar em ${props.companyName}.`}
      footerNote="Esta é uma mensagem automática; por favor, não responda."
    >
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        <div style={{ margin: '0 0 10px 0' }}>
          Olá, <strong>{props.employeeName}</strong>!
        </div>

        <div style={{ margin: '0 0 10px 0' }}>
          <strong>{props.inviterName}</strong> convidou você para fazer parte da
          equipe <strong>{props.companyName}</strong> na ToolDo.
        </div>

        <Callout variant="info">
          <strong style={{ color: '#1F2937' }}>Seu cargo:</strong> {roleName}
        </Callout>

        <div style={{ margin: '0 0 6px 0' }}>
          Para aceitar o convite e definir sua senha de acesso:
        </div>

        <PrimaryButton href={props.inviteLink} label="Aceitar convite" />

        <Callout variant="warning">
          <strong style={{ color: '#111827' }}>Importante:</strong> este convite
          é válido por <strong>7 dias</strong>. Após esse período, será
          necessário solicitar um novo convite.
        </Callout>

        <FallbackLink url={props.inviteLink} />

        <MutedText>
          Se você não esperava receber este convite ou não conhece{' '}
          <strong>{props.inviterName}</strong>, pode ignorar este email com
          segurança.
        </MutedText>
      </div>
    </BaseEmail>
  );
}

export function getEmployeeInvitePlainText(
  props: EmployeeInviteEmailProps,
): string {
  const roleNames: Record<string, string> = {
    manager: 'Gerente',
    executor: 'Executor',
    consultant: 'Consultor',
  };
  const roleName = roleNames[props.role] || props.role;

  return [
    `Olá, ${props.employeeName}!`,
    '',
    `${props.inviterName} convidou você para fazer parte da equipe ${props.companyName} na ToolDo.`,
    `Seu cargo: ${roleName}`,
    '',
    'Para aceitar o convite e definir sua senha, acesse:',
    props.inviteLink,
    '',
    'Importante: este convite é válido por 7 dias.',
    '',
    `Se você não esperava receber este convite ou não conhece ${props.inviterName}, ignore este email com segurança.`,
  ].join('\n');
}
