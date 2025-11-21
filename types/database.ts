/**
 * Type definitions for all Supabase database tables
 */

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  user_metadata?: {
    full_name?: string;
    language?: string;
    avatar_url?: string;
  };
}

// News types
export interface News {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string;
  imageUrl?: string;
  created_at: string;
  updated_at?: string;
}

// Services types
export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  created_at: string;
  updated_at?: string;
}

// Opportunities types
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  deadline: string;
  category?: string;
  link?: string;
  created_at: string;
  updated_at?: string;
}

// Reports types
export type ReportStatus = "pending" | "approved" | "rejected" | "in_progress";

export interface Report {
  id: string;
  title: string;
  description: string;
  location?: string;
  user_id?: string;
  is_anonymous: boolean;
  status: ReportStatus;
  created_at: string;
  updated_at?: string;
}

export type AttachmentType = "document" | "image" | "video" | "audio";

export interface ReportAttachment {
  id: string;
  report_id: string;
  name: string;
  path: string;
  type: AttachmentType;
  created_at: string;
}

export interface ReportWithAttachments extends Report {
  attachments?: ReportAttachment[];
}

// Fact Checks types
// Note: These values must match the database CHECK constraint
export type FactCheckVerdict =
  | "queued" // Newly submitted fact check
  | "in-progress" // Being reviewed by admin
  | "verified" // Verified as true/accurate
  | "disputed" // Disputed/false/misleading
  | "needs-review"; // Needs admin review

export interface FactCheck {
  id: string;
  title: string;
  description?: string;
  verdict: FactCheckVerdict;
  user_id?: string;
  attachments?: Array<{
    name: string;
    path: string;
    type: AttachmentType;
  }>;
  created_at: string;
  updated_at?: string;
}

export interface FactCheckAttachment {
  id: string;
  fact_check_id: string;
  name: string;
  path: string;
  type: AttachmentType;
  created_at: string;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: Error | null;
}

// Admin types
export interface AdminUser extends User {
  role: "admin" | "moderator" | "super_admin";
  permissions?: string[];
}
