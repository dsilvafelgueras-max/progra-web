// Validaciones compartidas entre cliente (formularios) y servidor (API routes).
// Un único lugar para la regla de email evita que cliente y servidor difieran.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

// Devuelve un objeto { campo: 'mensaje' } con los errores encontrados.
// Vacío ({}) significa que el formulario es válido.
export function validateCheckout(values) {
  const errors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = 'Completá tu nombre.';
  }
  if (!values.email?.trim()) {
    errors.email = 'Completá tu e-mail.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Ingresá un e-mail válido (ej: nombre@correo.com).';
  }
  if (!values.phone?.trim()) {
    errors.phone = 'Completá tu teléfono.';
  }
  if (values.deliveryMethod === 'domicilio') {
    if (!values.address?.trim()) errors.address = 'Completá la dirección.';
    if (!values.city?.trim())    errors.city    = 'Completá la ciudad.';
  }

  return errors;
}
