// Admite nombres compuestos, tildes, guiones y apóstrofos.
export function nombreCompletoValido(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length >= 3 && parts.every(part => /^\p{L}[\p{L}\p{M}]*(?:['’\-][\p{L}\p{M}]+)*$/u.test(part));
}
export const NOMBRE_COMPLETO_ERROR = 'Ingresa tu nombre y tus dos apellidos, separados por espacios (ej. Benjamín Pérez González).';