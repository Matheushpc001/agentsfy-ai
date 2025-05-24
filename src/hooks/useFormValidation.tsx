
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

interface ValidationErrors {
  [fieldName: string]: string | null;
}

export function useFormValidation(config: FormValidationConfig) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = config[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return null;

    // MinLength validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `Deve ter pelo menos ${rule.minLength} caracteres`;
    }

    // MaxLength validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `Deve ter no máximo ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [config]);

  const validateForm = useCallback((formData: { [key: string]: any }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(config).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  }, [config, validateField]);

  const validateSingleField = useCallback((name: string, value: any) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
    return error === null;
  }, [validateField]);

  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearErrors,
    hasErrors,
  };
}

// Validação comum para email
export const emailValidation: ValidationRule = {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  custom: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email inválido';
    }
    return null;
  }
};

// Validação comum para telefone
export const phoneValidation: ValidationRule = {
  required: true,
  pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  custom: (value: string) => {
    if (value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
      return 'Telefone inválido. Use o formato: (11) 99999-9999';
    }
    return null;
  }
};
