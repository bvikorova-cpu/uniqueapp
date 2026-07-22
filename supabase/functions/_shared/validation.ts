/**
 * Request validation utilities for edge functions
 */

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'uuid';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates a value against a validation rule
 */
function validateField(
  field: string,
  value: unknown,
  rule: ValidationRule
): { valid: boolean; message?: string } {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return { valid: false, message: rule.message || `${field} is required` };
  }

  // Skip further validation if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return { valid: true };
  }

  // Type validation
  if (rule.type) {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, message: rule.message || `${field} must be a string` };
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, message: rule.message || `${field} must be a number` };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, message: rule.message || `${field} must be a boolean` };
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return { valid: false, message: rule.message || `${field} must be an array` };
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          return { valid: false, message: rule.message || `${field} must be an object` };
        }
        break;
      case 'email':
        if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
          return { valid: false, message: rule.message || `${field} must be a valid email` };
        }
        break;
      case 'uuid':
        if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
          return { valid: false, message: rule.message || `${field} must be a valid UUID` };
        }
        break;
    }
  }

  // String length validation
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return {
        valid: false,
        message: rule.message || `${field} must be at least ${rule.minLength} characters` };
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return {
        valid: false,
        message: rule.message || `${field} must be at most ${rule.maxLength} characters` };
    }
  }

  // Number range validation
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return {
        valid: false,
        message: rule.message || `${field} must be at least ${rule.min}` };
    }
    if (rule.max !== undefined && value > rule.max) {
      return {
        valid: false,
        message: rule.message || `${field} must be at most ${rule.max}` };
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return {
      valid: false,
      message: rule.message || `${field} has invalid format` };
  }

  // Custom validation
  if (rule.custom && !rule.custom(value)) {
    return {
      valid: false,
      message: rule.message || `${field} is invalid` };
  }

  return { valid: true };
}

/**
 * Validates an object against a schema
 */
export function validate(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
  const errors: { field: string; message: string }[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const result = validateField(field, data[field], rule);
    if (!result.valid && result.message) {
      errors.push({ field, message: result.message });
    }
  }

  return { valid: errors.length === 0,
    errors };
}

/**
 * Parses and validates JSON body from request
 */
export async function parseAndValidate<T>(
  req: Request,
  schema: ValidationSchema
): Promise<{ data: T | null; errors: { field: string; message: string }[] }> {
  try {
    const body = await req.json();
    const result = validate(body, schema);
    
    if (!result.valid) {
      return { data: null, errors: result.errors };
    }
    
    return { data: body as T, errors: [] };
  } catch {
    return {
      data: null,
      errors: [{ field: '_body', message: 'Invalid JSON body' }] };
  }
}

/**
 * Sanitizes a string to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitizes an object's string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  
  return sanitized;
}
