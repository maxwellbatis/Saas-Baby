/**
 * Valida se um email tem formato válido
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se uma senha atende aos requisitos de segurança
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Valida se um nome tem formato válido
 */
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Mínimo 2 caracteres, máximo 50, apenas letras, espaços e alguns caracteres especiais
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return nameRegex.test(name);
}

/**
 * Valida se um ID tem formato válido (CUID)
 */
export function validateId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // CUID tem formato específico
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
} 