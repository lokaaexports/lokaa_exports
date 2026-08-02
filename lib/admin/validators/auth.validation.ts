// lib/admin/validators/auth.validation.js
// Authentication Validation Schemas

export const validateEmail = (email: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: any) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const validateOTP = (otp: any) => {
  // 6 digit OTP
  return /^\d{6}$/.test(otp)
}

export const validateLoginPayload = (email: any, password: any) => {
  const errors: Record<string, string> = {}

  if (!email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateOTPPayload = (otp: any, email: any) => {
  const errors: Record<string, string> = {}

  if (!otp) {
    errors.otp = 'OTP is required'
  } else if (!validateOTP(otp)) {
    errors.otp = 'OTP must be 6 digits'
  }

  if (!email) {
    errors.email = 'Email is required'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export const validatePasswordReset = (password: any, confirmPassword: any) => {
  const errors: Record<string, string> = {}

  if (!password) {
    errors.password = 'Password is required'
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateForgotPasswordPayload = (email: any) => {
  const errors: Record<string, string> = {}

  if (!email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export const getPasswordStrength = (password: any) => {
  let strength = 0
  let feedback = []

  if (!password) return { strength: 0, feedback: ['Password is required'] }

  // Length
  if (password.length >= 8) strength += 20
  else feedback.push('At least 8 characters')

  if (password.length >= 12) strength += 10

  // Uppercase
  if (/[A-Z]/.test(password)) strength += 20
  else feedback.push('Add uppercase letter')

  // Lowercase
  if (/[a-z]/.test(password)) strength += 20
  else feedback.push('Add lowercase letter')

  // Numbers
  if (/\d/.test(password)) strength += 20
  else feedback.push('Add number')

  // Special characters
  if (/[@$!%*?&]/.test(password)) strength += 10
  else feedback.push('Add special character')

  return {
    strength: Math.min(strength, 100),
    feedback,
    label: strength >= 80 ? 'Strong' : strength >= 60 ? 'Medium' : 'Weak'
  }
}
