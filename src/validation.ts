// Admite nombres compuestos, tildes, guiones y apóstrofos.
export function nombreCompletoValido(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length >= 3 && parts.every(part => /^\p{L}[\p{L}\p{M}]*(?:['’\-][\p{L}\p{M}]+)*$/u.test(part));
}
export const NOMBRE_COMPLETO_ERROR = 'Ingresa tu nombre y tus dos apellidos, separados por espacios (ej. Benjamín Pérez González).';

// Validación de teléfono chileno: prefijo 56 fijo + 9 dígitos = exactamente 11 dígitos, sin signo + ni espacios.
export const TELEFONO_REGEX = /^56\d{9}$/;
export function telefonoChilenoValido(value: string): boolean {
  return TELEFONO_REGEX.test(value.trim());
}
export const TELEFONO_ERROR = 'Ingresa un teléfono chileno válido: exactamente 11 dígitos con prefijo 56 fijo, sin signo + ni espacios (ej. 56912345678).';