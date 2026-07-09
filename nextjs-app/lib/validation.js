// Validaciones compartidas entre cliente (formularios) y servidor (API routes).
// Un único lugar para la regla de email evita que cliente y servidor difieran.

// Antes del @: letras minúsculas y números, con puntos como separadores entre
// bloques (nombre.apellido, juan.perez.2026, 12345.juan). El punto no puede ir
// al principio, al final ni repetido. Nada de mayúsculas ni otros símbolos.
// Después del @: solo dominios de proveedores conocidos.
const EMAIL_LOCAL_RE = /^[a-z0-9]+(\.[a-z0-9]+)*$/;
const EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'hotmail.com.ar',
  'live.com',
  'live.com.ar',
  'outlook.com',
  'outlook.com.ar',
  'yahoo.com',
  'yahoo.com.ar',
];

// Nombre: solo letras (incluye acentos y ñ), espacios, apóstrofes y guiones.
// Rechaza números y símbolos. Requiere al menos 2 letras.
const NAME_RE = /^[\p{L}][\p{L}\s'’-]*[\p{L}]$/u;

// Teléfono argentino. Se normaliza quitando espacios, guiones y paréntesis, y
// se valida sobre los dígitos: código de área + 8 números locales.
// Acepta el +54 internacional (opcional), el 0 nacional y el 9 de móvil.
// Ejemplos válidos: "+54 11 0000 0000", "011 1234 5678", "11 1234-5678".

export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const [local, domain, extra] = value.trim().split('@');
  if (extra !== undefined || !local || !domain) return false; // 0 o >1 arrobas
  return EMAIL_LOCAL_RE.test(local) && EMAIL_DOMAINS.includes(domain);
}

export function isValidName(value) {
  return typeof value === 'string' && NAME_RE.test(value.trim());
}

export function isValidPhone(value) {
  if (typeof value !== 'string') return false;

  // Nos quedamos solo con los dígitos y un + inicial opcional.
  let digits = value.trim().replace(/[\s().+-]/g, '');
  if (!/^\d+$/.test(digits)) return false;

  // Quitar el código de país argentino (+54) si viene incluido.
  if (digits.startsWith('54')) digits = digits.slice(2);
  // Quitar el 0 de acceso nacional y/o el 9 de móvil, según corresponda.
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('9')) digits = digits.slice(1);

  // Debe quedar: código de área (2 a 4 dígitos) + 8 números locales.
  // Ej: "11" (2) + 8 = 10 dígitos;  código de 4 + 8 = 12 dígitos.
  return /^\d{2,4}\d{8}$/.test(digits) && digits.length >= 10 && digits.length <= 12;
}

// Devuelve un objeto { campo: 'mensaje' } con los errores encontrados.
// Vacío ({}) significa que el formulario es válido.
export function validateCheckout(values) {
  const errors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = 'Completá tu nombre.';
  } else if (!isValidName(values.fullName)) {
    errors.fullName = 'El nombre solo puede tener letras (sin números ni símbolos).';
  }
  if (!values.email?.trim()) {
    errors.email = 'Completá tu e-mail.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Usá un e-mail válido con letras, números y puntos antes del @ (ej: juan.perez@gmail.com). Solo Gmail, Hotmail, Live, Outlook o Yahoo.';
  }
  if (!values.phone?.trim()) {
    errors.phone = 'Completá tu teléfono.';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = 'Ingresá un teléfono válido con prefijo y 8 números (ej: 11 1234 5678).';
  }
  if (values.deliveryMethod === 'domicilio') {
    if (!values.address?.trim()) errors.address = 'Completá la dirección.';
    if (!values.city?.trim())    errors.city    = 'Completá la ciudad.';
  }

  return errors;
}
