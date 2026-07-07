import { useState, useCallback } from "react";

export interface ValidationError {
  field: string;
  message: string;
  type: "error" | "warning";
}

export interface FormValidationState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FieldValidationState {
  name: ValidationError | null;
  email: ValidationError | null;
  password: ValidationError | null;
  confirmPassword: ValidationError | null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "weak" | "fair" | "good" | "strong" | "very-strong";
  color: string;
  requirements: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

const STRICT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: "email", message: "Email is required", type: "error" };
  }

  if (email.length > 254) {
    return { field: "email", message: "Email is too long", type: "error" };
  }

  if (!STRICT_EMAIL_REGEX.test(email)) {
    return { field: "email", message: "Please enter a valid email address", type: "error" };
  }

  return null;
};

export const validateName = (name: string): ValidationError | null => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { field: "name", message: "Full name is required", type: "error" };
  }

  if (trimmedName.length < 2) {
    return { field: "name", message: "Name must be at least 2 characters", type: "error" };
  }

  if (trimmedName.length > 100) {
    return { field: "name", message: "Name is too long", type: "error" };
  }

  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: "password", message: "Password is required", type: "error" };
  }

  if (password.length < 8) {
    return { field: "password", message: "Password must be at least 8 characters", type: "error" };
  }

  if (!/[A-Z]/.test(password)) {
    return { field: "password", message: "Password must contain an uppercase letter", type: "error" };
  }

  if (!/[a-z]/.test(password)) {
    return { field: "password", message: "Password must contain a lowercase letter", type: "error" };
  }

  if (!/[0-9]/.test(password)) {
    return { field: "password", message: "Password must contain a number", type: "error" };
  }

  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationError | null => {
  if (!confirmPassword) {
    return { field: "confirmPassword", message: "Please confirm your password", type: "error" };
  }

  if (password !== confirmPassword) {
    return { field: "confirmPassword", message: "Passwords don't match", type: "error" };
  }

  return null;
};

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;

  let score: PasswordStrength["score"] = 0;
  let label: PasswordStrength["label"] = "weak";
  let color = "text-red-500";

  if (metRequirements >= 3) {
    score = 1;
    label = "weak";
    color = "text-red-500";
  }
  if (metRequirements >= 4) {
    score = 2;
    label = "fair";
    color = "text-orange-500";
  }
  if (metRequirements >= 5) {
    score = 3;
    label = "good";
    color = "text-yellow-500";
  }
  if (requirements.hasMinLength && metRequirements === 5) {
    score = 4;
    label = "strong";
    color = "text-green-500";
  }
  if (password.length >= 12 && metRequirements === 5) {
    score = 4;
    label = "very-strong";
    color = "text-green-600";
  }

  return { score, label, color, requirements };
};

export const useFormValidation = (initialState: FormValidationState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
}) => {
  const [formData, setFormData] = useState<FormValidationState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<FieldValidationState>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);

  const validateField = useCallback(
    (fieldName: keyof FormValidationState, value: string = formData[fieldName]) => {
      let error: ValidationError | null = null;

      switch (fieldName) {
        case "name":
          error = validateName(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          error = validatePassword(value);
          setPasswordStrength(calculatePasswordStrength(value));
          break;
        case "confirmPassword":
          error = validatePasswordConfirmation(formData.password, value);
          break;
      }

      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      return error;
    },
    [formData]
  );

  const handleFieldChange = useCallback(
    (fieldName: keyof FormValidationState, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      validateField(fieldName, value);
    },
    [validateField]
  );

  const validateAllFields = useCallback((): boolean => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmError = validatePasswordConfirmation(formData.password, formData.confirmPassword);

    setFieldErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
    });

    return !nameError && !emailError && !passwordError && !confirmError;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setFieldErrors({
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    });
    setPasswordStrength(null);
  }, [initialState]);

  return {
    formData,
    fieldErrors,
    passwordStrength,
    handleFieldChange,
    validateField,
    validateAllFields,
    resetForm,
    setFormData,
  };
};
