/**
 * Input validation and sanitization utilities
 * Provides validation functions for user inputs
 */

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Text sanitization (basic XSS prevention)
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// Sanitize for display (removes HTML but preserves line breaks)
export function sanitizeForDisplay(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// Validate report title
export function validateReportTitle(title: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = title.trim();

  if (!trimmed) {
    return { isValid: false, error: "Title is required" };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Title must be at least 3 characters long",
    };
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: "Title must be less than 200 characters" };
  }

  return { isValid: true };
}

// Validate report description
export function validateReportDescription(description: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = description.trim();

  if (!trimmed) {
    return { isValid: false, error: "Description is required" };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: "Description must be at least 10 characters long",
    };
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: "Description must be less than 5000 characters",
    };
  }

  return { isValid: true };
}

// Validate location
export function validateLocation(location: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = location.trim();

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: "Location must be less than 200 characters",
    };
  }

  return { isValid: true };
}

// Validate fact check claim
export function validateFactCheckClaim(claim: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = claim.trim();

  if (!trimmed && trimmed.length === 0) {
    return { isValid: false, error: "Claim text is required" };
  }

  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: "Claim must be at least 5 characters long",
    };
  }

  if (trimmed.length > 2000) {
    return { isValid: false, error: "Claim must be less than 2000 characters" };
  }

  return { isValid: true };
}

// Validate file size (in bytes)
export function validateFileSize(
  size: number,
  maxSizeMB: number = 10
): {
  isValid: boolean;
  error?: string;
} {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

// Validate file type
export function validateFileType(
  fileName: string,
  allowedTypes: string[] = ["image", "video", "audio", "document"]
): {
  isValid: boolean;
  error?: string;
} {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    return { isValid: false, error: "Invalid file type" };
  }

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
  const audioExtensions = ["mp3", "wav", "m4a", "aac", "ogg"];
  const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf"];

  let fileType: string | null = null;

  if (imageExtensions.includes(extension)) {
    fileType = "image";
  } else if (videoExtensions.includes(extension)) {
    fileType = "video";
  } else if (audioExtensions.includes(extension)) {
    fileType = "audio";
  } else if (documentExtensions.includes(extension)) {
    fileType = "document";
  }

  if (!fileType || !allowedTypes.includes(fileType)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { isValid: true, error: undefined };
}

// Sanitize user input for database
export function sanitizeUserInput(input: string): string {
  return sanitizeText(input)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n"); // Limit consecutive line breaks
}

// Validate URL
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
