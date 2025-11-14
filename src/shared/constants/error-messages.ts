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

  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
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
