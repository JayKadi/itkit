// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Full name validation
export const isValidFullName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Validation errors
export const validateRegistration = (
  email: string,
  password: string,
  full_name: string
): string | null => {
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }

  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters long';
  }

  if (!isValidFullName(full_name)) {
    return 'Full name must be at least 2 characters long';
  }

  return null; // No errors
};