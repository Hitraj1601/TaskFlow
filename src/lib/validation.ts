export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!password || password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long",
    });
  }
  if (password.length > 128) {
    errors.push({
      field: "password",
      message: "Password must be less than 128 characters",
    });
  }
  return errors;
}

export function validateTaskTitle(title: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!title || title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  }
  if (title && title.length > 200) {
    errors.push({
      field: "title",
      message: "Title must be less than 200 characters",
    });
  }
  return errors;
}

export function validateTaskStatus(status: string): boolean {
  return ["todo", "in-progress", "done"].includes(status);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

export function validateRegistration(data: {
  name?: string;
  email?: string;
  password?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    });
  }
  if (data.name && data.name.length > 100) {
    errors.push({
      field: "name",
      message: "Name must be less than 100 characters",
    });
  }
  if (!data.email || !validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please provide a valid email address",
    });
  }
  errors.push(...validatePassword(data.password || ""));
  return errors;
}

export function validateLogin(data: {
  email?: string;
  password?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.email || !validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please provide a valid email address",
    });
  }
  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" });
  }
  return errors;
}
