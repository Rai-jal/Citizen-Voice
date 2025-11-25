/**
 * Supabase Service Layer
 * Centralized database operations
 */

import { supabase } from "../lib/supabase";
import type {
  AttachmentType,
  FactCheck,
  FactCheckVerdict,
  News,
  Opportunity,
  Report,
  ReportAttachment,
  ReportWithAttachments,
  Service,
} from "../types";

// News operations
export const newsService = {
  async getAll(): Promise<{ data: News[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async getById(
    id: string
  ): Promise<{ data: News | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

// Services operations
export const servicesService = {
  async getAll(): Promise<{ data: Service[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async getById(
    id: string
  ): Promise<{ data: Service | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

// Opportunities operations
export const opportunitiesService = {
  async getAll(): Promise<{ data: Opportunity[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async getById(
    id: string
  ): Promise<{ data: Opportunity | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

// Reports operations
export const reportsService = {
  async getAllApproved(): Promise<{
    data: ReportWithAttachments[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          report_attachments (
            id,
            name,
            path,
            type,
            created_at
          )
        `
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async create(
    report: Omit<Report, "id" | "created_at" | "updated_at">
  ): Promise<{ data: Report | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .insert([report])
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async addAttachments(
    reportId: string,
    attachments: Omit<ReportAttachment, "id" | "created_at">[]
  ): Promise<{ data: ReportAttachment[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("report_attachments")
        .insert(
          attachments.map((att) => ({
            report_id: reportId,
            name: att.name,
            path: att.path,
            type: att.type,
          }))
        )
        .select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async update(
    reportId: string,
    updates: Partial<Report>
  ): Promise<{ data: Report | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .update(updates)
        .eq("id", reportId)
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

// Fact checks operations
export const factChecksService = {
  async getAll(): Promise<{ data: FactCheck[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("fact_checks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  async create(
    factCheck: Omit<FactCheck, "id" | "created_at" | "updated_at">
  ): Promise<{ data: FactCheck | null; error: Error | null }> {
    try {
      // Prepare fact check data (handle attachments array)
      const factCheckData: {
        title: string;
        description?: string;
        verdict: FactCheckVerdict;
        user_id?: string;
        attachments?: Array<{
          name: string;
          path: string;
          type: AttachmentType;
        }>;
      } = {
        title: factCheck.title,
        description: factCheck.description,
        verdict: factCheck.verdict,
        user_id: factCheck.user_id,
      };

      // If attachments are provided, store them as JSON
      if (factCheck.attachments && factCheck.attachments.length > 0) {
        factCheckData.attachments = factCheck.attachments;
      }

      const { data, error } = await supabase
        .from("fact_checks")
        .insert([factCheckData])
        .select()
        .single();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },
};

// Storage operations
export const storageService = {
  async uploadFile(
    bucket: string,
    path: string,
    file: Blob | File,
    options?: { contentType?: string }
  ): Promise<{ data: string | null; error: Error | null }> {
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: options?.contentType || "application/octet-stream",
        upsert: false,
      });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: path, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown error occurred"),
      };
    }
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
