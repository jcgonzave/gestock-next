const ROLES = {
  ADMIN: 'ADMIN',
  COMPANY: 'COMPANY',
  FARMER: 'FARMER',
  COWBOY: 'COWBOY',
};

const LISTS = {
  COLOR: 'COLOR',
  STATE: 'STATE',
  STAGE: 'STAGE',
  LOT: 'LOT',
  MEDICINE: 'MEDICINE',
  WEIGHT: 'WEIGHT',
  BREED: 'BREED',
  REPRODUCTION: 'REPRODUCTION',
  GENDER: 'GENDER',
  LOSS: 'LOSS',
  VACCINE: 'VACCINE',
};

const SUCCESS_MESSAGES = {
  SUCCESS_EDITED: 'SUCCESS_EDITED',
  SUCCESS_SAVED: 'SUCCESS_SAVED',
  SUCCESS_DELETED: 'SUCCESS_DELETED',
  SUCCESS_SESSION_STARTED: 'SUCCESS_SESSION_STARTED',
  SUCCESS_MAIL_SENT: 'SUCCESS_MAIL_SENT',
};

const ERROR_MESSAGES = {
  ERROR_INVALID_TOKEN: 'ERROR_INVALID_TOKEN',
  ERROR_NO_TOKEN_SENT: 'ERROR_NO_TOKEN_SENT',
  ERROR_NO_MODULE_ACCESS: 'ERROR_NO_MODULE_ACCESS',
  ERROR_USER_NOT_FOUND: 'ERROR_USER_NOT_FOUND',
  ERROR_INVALID_USER_OR_PASSWORD: 'ERROR_INVALID_USER_OR_PASSWORD',
  ERROR_PASSWORD_MUST_MATCH: 'ERROR_PASSWORD_MUST_MATCH',
  ERROR_DUPLICATE_KEY: 'ERROR_DUPLICATE_KEY',
  ERROR_FOREIGN_KEY: 'ERROR_FOREIGN_KEY',
  ERROR_DELETE_ADMIN: 'ERROR_DELETE_ADMIN',
  ERROR_DELETE_HIMSELF: 'ERROR_DELETE_HIMSELF',
};

export { ROLES, LISTS, SUCCESS_MESSAGES, ERROR_MESSAGES };
