const dictionary: any = {
  actions: {
    title: 'Acciones',
    ok: 'Aceptar',
    search: 'Buscar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    logout: 'Cerrar sesión',
    edit: 'Editar',
    delete: 'Eliminar',
    send: 'Enviar',
    confirm: '¿Estás seguro?',
    export: 'Exportar',
    filter: 'Filtrar',
    save: 'Guardar',
    login: 'Iniciar sesión',
    reset: 'Limpiar',
    no: 'No',
    return: 'Regresar',
    yes: 'Si',
  },
  date: {
    January: 'Enero',
    February: 'Febrero',
    March: 'Marzo',
    April: 'Abril',
    May: 'Mayo',
    June: 'Junio',
    July: 'Julio',
    August: 'Agosto',
    September: 'Septiembre',
    October: 'Octubre',
    November: 'Noviembre',
    December: 'Diciembre',
    of: 'de',
  },
  states: {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
  },
  lists: {
    COLOR: 'Color',
    DISEASE: 'Enfermedad',
    STATE: 'Estado reproductivo',
    STAGE: 'Etapa de desarrollo',
    LOT: 'Lote',
    MEDICINE: 'Medicamento',
    WEIGHT: 'Peso',
    BREED: 'Raza',
    REPRODUCTION: 'Reproducción',
    GENDER: 'Sexo',
    LOSS: 'Siniestro',
    VACCINE: 'Vacuna',
  },
  menu: {
    animals: 'Animales',
    upload: 'Cargar datos',
    admin: 'Configuración',
    stats: 'Estadísticas',
    farms: 'Fincas',
    weight: 'Informe de peso',
    listItems: 'Listas',
    lots: 'Lotes de animales',
    reports: 'Reportes',
    roles: 'Roles',
    users: 'Usuarios',
  },
  rules: {
    required: 'Campo requerido!',
    invalidEmail: 'Correo electrónico no válido!',
    integer: 'Debe ser un número entero',
    minLength: 'Mínimo {{number}} caracteres',
    maxLength: 'Máximo {{number}} caracteres',
    passwordMismatch: "'Las contraseñas ingresadas deben coincidir",
  },
  general: {
    unauthorized: 'Se requieren permisos para acceder a este sitio',
    copyRight:
      'Copyright © 2022 Trazii - Todos los derechos reservados. Un producto',
    termsConditions: 'Términos y condiciones',
  },
  login: {
    title: 'Iniciar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
  },
  passwordRecovery: {
    title: 'Recuperar contraseña',
    email: 'Correo electrónico',
  },
  passwordReset: {
    title: 'Cambiar contraseña',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    changePassword: 'Cambiar contraseña',
    warningTitle: 'El tiempo para resetear su contraseña ha caducado',
    warningMessage: 'Intente de nuevo y recuerde que tiene 1 día para hacerlo',
    successMessage: 'Su contraseña se ha cambiado correctamente',
  },
  animal: {
    listTitle: 'Animales',
    formTitle: 'Animal',
    code: 'Número de TAG',
    farm: 'Finca',
    addButton: 'Agregar animal',
  },
  farm: {
    listTitle: 'Fincas',
    formTitle: 'Finca',
    name: 'Nombre',
    farmer: 'Ganadero',
    cowboys: 'Vaqueros',
    addButton: 'Agregar finca',
  },
  listItem: {
    listTitle: 'Listas',
    formTitle: 'Elemento de lista',
    list: 'Lista',
    item: 'Elemento',
    state: 'Estado',
    addButton: 'Agregar elemento',
  },
  role: {
    listTitle: 'Roles',
    formTitle: 'Rol',
    name: 'Nombre',
    modules: 'Módulos',
    addButton: 'Agregar rol',
  },
  user: {
    listTitle: 'Usuarios',
    formTitle: 'Usuario',
    parent: 'Superior',
    name: 'Nombre',
    email: 'Email',
    phone: 'Celular',
    role: 'Rol',
    addButton: 'Agregar usuario',
    DUPLICATE_USER: 'Ya existe un usuario con el email ingresado',
  },
  upload: {
    title: 'Cargar datos',
    farm: 'Finca',
    file: 'Archivo',
    help: 'Seleccione un archivo o arrástrelo a este cuadro',
    invalidExtension: 'El archivo debe ser de tipo {{extension}}',
    result: {
      title: 'Resultado de la carga',
      resumes: 'Hojas de vida creadas/actualizadas',
      events: 'Eventos creados',
    },
    invalid: {
      title: 'Datos no válidos encontrados en el archivo',
      sheet: 'Hoja',
      row: 'Fila',
      columns: 'Columna(s) con datos no válidos',
    },
    completed: 'El archivo ha sido procesado',
  },
  resume: {
    code: 'Número de TAG',
    breed: 'Raza',
    stage: 'Etapa de desarrollo',
    gender: 'Sexo',
    weight: 'Peso (Kilos)',
  },
  report: {
    farm: 'Seleccione una finca',
    month: 'Seleccione un mes',
  },
  stats: {
    item: 'Item',
    animals: 'Animales',
    events: 'Eventos',
    amount: 'Cantidad',
    access: 'Accesos',
    user: 'Usuario',
    date: 'Fecha',
  },
  messages: {
    SUCCESS_EDITED: 'Registro editado con éxito.',
    SUCCESS_SAVED: 'Registro guardado con éxito.',
    SUCCESS_DELETED: 'Registro eliminado con éxito',
    SUCCESS_SESSION_STARTED: 'Sesión iniciada con éxito',
    SUCCESS_MAIL_SENT:
      'Se ha enviado un correo para realizar el cambio de la contraseña',
    ERROR_INVALID_TOKEN: 'Token de autorización no válido',
    ERROR_NO_TOKEN_SENT: 'Token de autorización no enviado',
    ERROR_NO_MODULE_ACCESS: 'No está autorizado para acceder a este módulo',
    ERROR_USER_NOT_FOUND: 'Usuario no encontrado',
    ERROR_INVALID_USER_OR_PASSWORD: 'Usuario o contraseña no válida',
    ERROR_PASSWORD_MUST_MATCH: 'Las contraseñas deben coincidir',
    ERROR_DUPLICATE_KEY:
      'Ya existe un registro que coincide con los datos ingresados',
    ERROR_FOREIGN_KEY:
      'No es posible eliminar este registro debido a que tiene dependencias',
    ERROR_DELETE_HIMSELF: 'Un usuario no puede eliminarse a si mismo',
    ERROR_DELETE_ADMIN: 'No es posible eliminar un usuario con rol Admin.',
  },
};

export const t = (term: string): string => {
  const [section, label] = term.split('.');
  if (!section || !label) {
    return '';
  }
  return dictionary[section] && (dictionary[section][label] || '');
};

export const getErrorMessage = (message: string): string => {
  const key = `messages.${message.replace('Error: ', '')}`;
  const translation = t(key);
  return translation === key ? message : translation;
};
