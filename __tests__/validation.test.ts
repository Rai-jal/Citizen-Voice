/**
 * Unit tests for validation utilities
 */

import {
  sanitizeText,
  sanitizeUserInput,
  validateEmail,
  validateFileSize,
  validateFileType,
  validatePassword,
  validateReportDescription,
  validateReportTitle,
} from "../lib/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@example.co.uk")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("invalid@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const result = validatePassword("Password123");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const result = validatePassword("weak");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require minimum length", () => {
      const result = validatePassword("Pass1");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password must be at least 8 characters long"
      );
    });
  });

  describe("validateReportTitle", () => {
    it("should validate correct titles", () => {
      const result = validateReportTitle("Valid Report Title");
      expect(result.isValid).toBe(true);
    });

    it("should reject empty titles", () => {
      const result = validateReportTitle("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("should reject titles that are too short", () => {
      const result = validateReportTitle("AB");
      expect(result.isValid).toBe(false);
    });

    it("should reject titles that are too long", () => {
      const result = validateReportTitle("A".repeat(201));
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateReportDescription", () => {
    it("should validate correct descriptions", () => {
      const result = validateReportDescription(
        "This is a valid description with enough text"
      );
      expect(result.isValid).toBe(true);
    });

    it("should reject empty descriptions", () => {
      const result = validateReportDescription("");
      expect(result.isValid).toBe(false);
    });

    it("should reject descriptions that are too short", () => {
      const result = validateReportDescription("Short");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateFileSize", () => {
    it("should validate file sizes within limit", () => {
      const result = validateFileSize(5 * 1024 * 1024, 10); // 5MB, limit 10MB
      expect(result.isValid).toBe(true);
    });

    it("should reject files that are too large", () => {
      const result = validateFileSize(15 * 1024 * 1024, 10); // 15MB, limit 10MB
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateFileType", () => {
    it("should validate image files", () => {
      const result = validateFileType("image.jpg", ["image"]);
      expect(result.isValid).toBe(true);
    });

    it("should validate video files", () => {
      const result = validateFileType("video.mp4", ["video"]);
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid file types", () => {
      const result = validateFileType("file.exe", ["image", "video"]);
      expect(result.isValid).toBe(false);
    });
  });

  describe("sanitizeText", () => {
    it("should sanitize HTML tags", () => {
      const result = sanitizeText("<script>alert('xss')</script>");
      expect(result).not.toContain("<script>");
    });

    it("should trim whitespace", () => {
      const result = sanitizeText("  text  ");
      expect(result).toBe("text");
    });
  });

  describe("sanitizeUserInput", () => {
    it("should sanitize user input", () => {
      const result = sanitizeUserInput("<script>alert('xss')</script>");
      expect(result).not.toContain("<script>");
    });

    it("should handle line breaks", () => {
      const result = sanitizeUserInput("Line1\r\nLine2\rLine3\nLine4");
      expect(result).toContain("\n");
    });
  });
});
