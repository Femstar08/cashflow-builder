import { describe, it, expect } from 'vitest';
import {
  validateUUID,
  validateEmail,
  validateString,
  validateNumber,
  validateFileName,
  validateFileType,
  validateFileSize,
  ValidationError,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateUUID', () => {
    it('should validate correct UUID', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(validateUUID(uuid)).toBe(uuid);
    });

    it('should throw for invalid UUID format', () => {
      expect(() => validateUUID('not-a-uuid')).toThrow(ValidationError);
    });

    it('should throw for non-string input', () => {
      expect(() => validateUUID(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe('test@example.com');
    });

    it('should throw for invalid email', () => {
      expect(() => validateEmail('not-an-email')).toThrow(ValidationError);
    });
  });

  describe('validateString', () => {
    it('should validate string with length constraints', () => {
      expect(validateString('hello', { minLength: 3, maxLength: 10 })).toBe('hello');
    });

    it('should throw if string too short', () => {
      expect(() => validateString('hi', { minLength: 3 })).toThrow(ValidationError);
    });

    it('should throw if string too long', () => {
      expect(() => validateString('a'.repeat(101), { maxLength: 100 })).toThrow(ValidationError);
    });

    it('should allow optional strings', () => {
      expect(validateString(null, { required: false })).toBe('');
    });
  });

  describe('validateNumber', () => {
    it('should validate number in range', () => {
      expect(validateNumber(5, { min: 1, max: 10 })).toBe(5);
    });

    it('should throw if number too small', () => {
      expect(() => validateNumber(0, { min: 1 })).toThrow(ValidationError);
    });

    it('should throw if number too large', () => {
      expect(() => validateNumber(11, { max: 10 })).toThrow(ValidationError);
    });
  });

  describe('validateFileName', () => {
    it('should validate safe file name', () => {
      expect(validateFileName('document.pdf')).toBe('document.pdf');
    });

    it('should reject path traversal attempts', () => {
      expect(() => validateFileName('../etc/passwd')).toThrow(ValidationError);
      expect(() => validateFileName('../../file.txt')).toThrow(ValidationError);
    });

    it('should reject names with slashes', () => {
      expect(() => validateFileName('path/to/file.txt')).toThrow(ValidationError);
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file type', () => {
      const allowed = ['application/pdf', 'image/png'];
      expect(validateFileType('application/pdf', allowed)).toBe('application/pdf');
    });

    it('should throw for disallowed file type', () => {
      const allowed = ['application/pdf'];
      expect(() => validateFileType('application/x-executable', allowed)).toThrow(ValidationError);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      expect(validateFileSize(1024, 2048)).toBe(1024);
    });

    it('should throw if file too large', () => {
      expect(() => validateFileSize(2049, 2048)).toThrow(ValidationError);
    });

    it('should throw for negative size', () => {
      expect(() => validateFileSize(-1, 2048)).toThrow(ValidationError);
    });
  });
});

