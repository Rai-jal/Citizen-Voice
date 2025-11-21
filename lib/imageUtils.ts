/**
 * Image utility functions
 * Handles image URL generation from Supabase Storage
 */

import { storageService } from "../services/supabaseService";

/**
 * Get public URL for an image from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in storage
 * @returns Public URL for the image
 */
export function getImageUrl(bucket: string, path: string): string {
  // If path is already a full URL, return it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get public URL from Supabase Storage
  return storageService.getPublicUrl(bucket, path);
}

/**
 * Get image URL for news item
 */
export function getNewsImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return getImageUrl("news-images", imageUrl);
}

/**
 * Get image URL for report attachment
 */
export function getReportAttachmentUrl(path: string): string {
  return getImageUrl("report-attachments", path);
}

/**
 * Get image URL for fact check attachment
 */
export function getFactCheckAttachmentUrl(path: string): string {
  return getImageUrl("fact-checks", path);
}
