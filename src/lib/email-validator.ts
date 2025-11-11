// src/lib/email-validator.ts

/**
 * Comprehensive email validation utility
 */

// Common educational domains (can be expanded)
const EDUCATIONAL_DOMAINS = [
  'edu',
  'ac.uk',
  'edu.au',
  'edu.in',
  'ac.in',
  'edu.cn',
  'sch.uk'
];

// Disposable email domains (can be expanded)
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'throwawaymail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com'
];

export interface EmailValidationResult {
  isValid: boolean;
  message?: string;
  domain?: string;
}

/**
 * Validates email format and checks for common issues
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  const domain = email.split('@')[1].toLowerCase();
  
  // Check for disposable emails
  if (DISPOSABLE_DOMAINS.some(disposable => domain.includes(disposable))) {
    return { 
      isValid: false, 
      message: 'Disposable email addresses are not allowed' 
    };
  }

  // Check if it's an educational domain (optional, for future use)
  const isEducational = EDUCATIONAL_DOMAINS.some(eduDomain => 
    domain.endsWith(eduDomain)
  );

  return { 
    isValid: true, 
    domain,
    message: isEducational ? 'Educational email detected' : undefined
  };
}

/**
 * Extracts domain from email for additional validation
 */
export function getEmailDomain(email: string): string | null {
  const match = email.match(/@([^@]+)$/);
  return match ? match[1].toLowerCase() : null;
}