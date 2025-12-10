/**
 * Input validation utilities
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(value: unknown, fieldName = 'id'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`, fieldName);
  }
  return value;
}

/**
 * Validate email format
 */
export function validateEmail(value: unknown, fieldName = 'email'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid email address`, fieldName);
  }
  return value;
}

/**
 * Validate string with length constraints
 */
export function validateString(
  value: unknown,
  options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): string {
  const { fieldName = 'field', minLength, maxLength, required = true } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return '';
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }

  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be no more than ${maxLength} characters`,
      fieldName
    );
  }

  return value;
}

/**
 * Validate number with range constraints
 */
export function validateNumber(
  value: unknown,
  options: {
    fieldName?: string;
    min?: number;
    max?: number;
    required?: boolean;
  } = {}
): number {
  const { fieldName = 'field', min, max, required = true } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return 0;
  }

  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName);
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max}`, fieldName);
  }

  return num;
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize file name
 */
export function validateFileName(fileName: string): string {
  const sanitized = sanitizeString(fileName);
  
  // Remove path traversal attempts
  if (sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
    throw new ValidationError('Invalid file name', 'fileName');
  }

  // Check length
  if (sanitized.length > 255) {
    throw new ValidationError('File name too long', 'fileName');
  }

  return sanitized;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): string {
  if (!allowedTypes.includes(mimeType)) {
    throw new ValidationError(
      `File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      'fileType'
    );
  }
  return mimeType;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSizeBytes: number): number {
  if (size > maxSizeBytes) {
    throw new ValidationError(
      `File size exceeds maximum of ${maxSizeBytes} bytes`,
      'fileSize'
    );
  }
  if (size < 0) {
    throw new ValidationError('File size must be positive', 'fileSize');
  }
  return size;
}

