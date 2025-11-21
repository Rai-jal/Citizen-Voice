/**
 * Admin Authentication and Authorization
 * Checks if a user has admin privileges
 */

import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface AdminUser extends User {
  role?: "admin" | "moderator" | "super_admin";
  permissions?: string[];
}

/**
 * Check if current user is an admin
 * Prefers server-side check via public.is_admin() to reflect DB roles immediately.
 * Falls back to user metadata for legacy compatibility.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return false;
    }

    // 1) Authoritative server-side check (RLS-safe)
    try {
      const { data: isAdminRpc, error: rpcError } = await supabase.rpc("is_admin");
      if (!rpcError && typeof isAdminRpc === "boolean") {
        return isAdminRpc;
      }
    } catch (e) {
      // Ignore and fall back to metadata
    }

    // 2) Fallback: client metadata (only used if RPC unavailable)
    const role = user.user_metadata?.role as string | undefined;
    const isAdminUser =
      role === "admin" ||
      role === "moderator" ||
      role === "super_admin" ||
      (user.email?.endsWith("@admin.citizenvoice.com") ?? false);
    return !!isAdminUser;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get admin user with role information
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const role = (user.user_metadata?.role as string) || "user";
    const isAdminUser =
      role === "admin" ||
      role === "moderator" ||
      role === "super_admin" ||
      user.email?.endsWith("@admin.citizenvoice.com");

    if (!isAdminUser) {
      return null;
    }

    return {
      ...user,
      role: role as "admin" | "moderator" | "super_admin",
      permissions: user.user_metadata?.permissions as string[] | undefined,
    };
  } catch (error) {
    console.error("Error getting admin user:", error);
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return false;
    }

    // Super admin has all permissions
    if (adminUser.role === "super_admin") {
      return true;
    }

    // Check specific permissions
    return adminUser.permissions?.includes(permission) || false;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

