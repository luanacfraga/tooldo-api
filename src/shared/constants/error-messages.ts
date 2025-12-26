export const ErrorMessages = {
  USER: {
    ID_REQUIRED: 'O id do usuário é obrigatório',
    FIRST_NAME_REQUIRED: 'O primeiro nome do usuário é obrigatório',
    LAST_NAME_REQUIRED: 'O sobrenome do usuário é obrigatório',
    EMAIL_REQUIRED: 'O email do usuário é obrigatório',
    EMAIL_INVALID: 'O email do usuário é inválido',
    EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
    PHONE_REQUIRED: 'O telefone do usuário é obrigatório',
    PHONE_ALREADY_EXISTS: 'Telefone já cadastrado',
    DOCUMENT_REQUIRED: 'O documento do usuário é obrigatório',
    DOCUMENT_ALREADY_EXISTS: 'Documento já cadastrado',
    PASSWORD_REQUIRED: 'A senha do usuário é obrigatória',
    PASSWORD_MIN_LENGTH: 'A senha deve ter pelo menos 6 caracteres',
  },

  COMPANY: {
    ID_REQUIRED: 'O id da empresa é obrigatório',
    NAME_REQUIRED: 'O nome da empresa é obrigatório',
    ADMIN_ID_REQUIRED: 'O adminId da empresa é obrigatório',
    ADMIN_NOT_FOUND: 'Administrador não encontrado',
    SUBSCRIPTION_NOT_FOUND:
      'Assinatura ativa não encontrada para o administrador',
    MAX_COMPANIES_EXCEEDED: 'Limite máximo de empresas do plano foi excedido',
  },

  PLAN: {
    ID_REQUIRED: 'O id do plano é obrigatório',
    NAME_REQUIRED: 'O nome do plano é obrigatório',
    NOT_FOUND: 'Plano não encontrado',
    DEFAULT_NOT_FOUND:
      'Plano padrão não encontrado. Por favor, crie um plano padrão primeiro.',
    MAX_COMPANIES_INVALID:
      'O maxCompanies do plano deve ser maior ou igual a 0',
    MAX_MANAGERS_INVALID: 'O maxManagers do plano deve ser maior ou igual a 0',
    MAX_EXECUTORS_INVALID:
      'O maxExecutors do plano deve ser maior ou igual a 0',
    MAX_CONSULTANTS_INVALID:
      'O maxConsultants do plano deve ser maior ou igual a 0',
    IA_CALLS_LIMIT_INVALID:
      'O iaCallsLimit do plano deve ser maior ou igual a 0',
  },

  SUBSCRIPTION: {
    ID_REQUIRED: 'O id da assinatura é obrigatório',
    ADMIN_ID_REQUIRED: 'O adminId da assinatura é obrigatório',
    PLAN_ID_REQUIRED: 'O planId da assinatura é obrigatório',
    STARTED_AT_INVALID: 'O startedAt da assinatura deve ser uma data válida',
  },

  COMPANY_USER: {
    ID_REQUIRED: 'O id do funcionário é obrigatório',
    COMPANY_ID_REQUIRED: 'O companyId do funcionário é obrigatório',
    USER_ID_REQUIRED: 'O userId do funcionário é obrigatório',
    ROLE_REQUIRED: 'O cargo do funcionário é obrigatório',
    STATUS_REQUIRED: 'O status do funcionário é obrigatório',
    ALREADY_EXISTS: 'Este usuário já faz parte desta empresa',
    NOT_FOUND: 'Funcionário não encontrado',
    INVITE_EXPIRED: 'Este convite expirou',
    ALREADY_ACCEPTED: 'Este convite já foi aceito',
    ALREADY_REJECTED: 'Este convite já foi rejeitado',
    MAX_MANAGERS_EXCEEDED: 'Limite máximo de gerentes do plano foi excedido',
    MAX_EXECUTORS_EXCEEDED: 'Limite máximo de executores do plano foi excedido',
    MAX_CONSULTANTS_EXCEEDED:
      'Limite máximo de consultores do plano foi excedido',
    TOKEN_OR_COMPANY_USER_ID_REQUIRED:
      'Nem token nem companyUserId foram fornecidos',
    INVITE_CANNOT_BE_ACCEPTED: 'Este convite não pode mais ser aceito',
    DOCUMENT_MISMATCH: 'O CPF informado não corresponde ao CPF do convite',
  },

  TEAM: {
    ID_REQUIRED: 'O id da equipe é obrigatório',
    NAME_REQUIRED: 'O nome da equipe é obrigatório',
    COMPANY_ID_REQUIRED: 'O companyId da equipe é obrigatório',
    MANAGER_ID_REQUIRED: 'O managerId da equipe é obrigatório',
    NOT_FOUND: 'Equipe não encontrada',
    MANAGER_NOT_FOUND: 'Gestor não encontrado na empresa',
    MANAGER_NOT_MANAGER_ROLE: 'O gestor deve ter o papel de manager na empresa',
    MANAGER_ALREADY_IN_TEAM: 'Este gestor já está gerenciando outra equipe',
    EXECUTOR_NOT_FOUND: 'Executor não encontrado na empresa',
    EXECUTOR_NOT_EXECUTOR_ROLE:
      'O executor deve ter o papel de executor na empresa',
    EXECUTOR_ALREADY_IN_TEAM: 'Este executor já faz parte desta equipe',
  },

  TEAM_USER: {
    ID_REQUIRED: 'O id do membro da equipe é obrigatório',
    TEAM_ID_REQUIRED: 'O teamId do membro da equipe é obrigatório',
    USER_ID_REQUIRED: 'O userId do membro da equipe é obrigatório',
    NOT_FOUND: 'Membro da equipe não encontrado',
    ALREADY_EXISTS: 'Este executor já faz parte desta equipe',
    ALREADY_IN_ANOTHER_TEAM: 'Este executor já faz parte de outra equipe',
  },

  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    INVALID_TOKEN: 'Token inválido',
    INVALID_OR_EXPIRED_INVITE_TOKEN: 'Token de convite inválido ou expirado',
    INVALID_OR_EXPIRED_RESET_TOKEN: 'Token de recuperação inválido ou expirado',
    LEGACY_INVITE_TOKEN:
      'Token de convite inválido. Este token foi gerado antes da atualização do sistema. Por favor, solicite um novo convite.',
  },

  ACTION: {
    ID_REQUIRED: 'O id da ação é obrigatório',
    TITLE_REQUIRED: 'O título da ação é obrigatório',
    DESCRIPTION_REQUIRED: 'A descrição da ação é obrigatória',
    COMPANY_ID_REQUIRED: 'O companyId da ação é obrigatório',
    CREATOR_ID_REQUIRED: 'O creatorId da ação é obrigatório',
    RESPONSIBLE_ID_REQUIRED: 'O responsibleId da ação é obrigatório',
    ESTIMATED_START_DATE_REQUIRED: 'A data estimada de início é obrigatória',
    ESTIMATED_END_DATE_REQUIRED: 'A data estimada de término é obrigatória',
    ESTIMATED_START_DATE_INVALID:
      'A data estimada de início deve ser uma data válida',
    ESTIMATED_END_DATE_INVALID:
      'A data estimada de término deve ser uma data válida',
    ESTIMATED_END_DATE_BEFORE_START:
      'A data estimada de término deve ser após a data de início',
    ACTUAL_START_DATE_INVALID: 'A data real de início deve ser uma data válida',
    ACTUAL_END_DATE_INVALID: 'A data real de término deve ser uma data válida',
    BLOCKED_REASON_REQUIRED:
      'O motivo do bloqueio é obrigatório quando a ação está bloqueada',
    NOT_FOUND: 'Ação não encontrada',
  },

  CHECKLIST_ITEM: {
    ID_REQUIRED: 'O id do item da checklist é obrigatório',
    ACTION_ID_REQUIRED: 'O actionId do item da checklist é obrigatório',
    DESCRIPTION_REQUIRED: 'A descrição do item da checklist é obrigatória',
    ORDER_INVALID: 'A ordem do item da checklist deve ser maior ou igual a 0',
  },

  ACTION_MOVEMENT: {
    ID_REQUIRED: 'O id do movimento é obrigatório',
    ACTION_ID_REQUIRED: 'O actionId do movimento é obrigatório',
    MOVED_BY_ID_REQUIRED: 'O movedById do movimento é obrigatório',
    MOVED_AT_INVALID: 'A data do movimento deve ser uma data válida',
  },
  VALIDATION: {
    STRING_REQUIRED: 'Este campo deve ser uma string',
    NOT_EMPTY: 'Este campo é obrigatório',
    EMAIL_INVALID: 'O email deve ser válido',
    ENUM_INVALID: 'Valor inválido para este campo',
    POSITIVE_NUMBER: 'Este campo deve ser um número positivo',
    INTEGER_REQUIRED: 'Este campo deve ser um número inteiro',
  },
} as const;
