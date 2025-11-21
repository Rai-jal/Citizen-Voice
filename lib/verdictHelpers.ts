/**
 * Fact Check Verdict Helpers
 * Utility functions for working with fact check verdicts
 * Note: Verdicts must match database CHECK constraint:
 * 'queued', 'in-progress', 'verified', 'disputed', 'needs-review'
 */

import type { FactCheckVerdict } from "../types";

/**
 * Get human-readable label for verdict
 */
export function getVerdictLabel(verdict: FactCheckVerdict): string {
  switch (verdict) {
    case "queued":
      return "Queued";
    case "in-progress":
      return "In Progress";
    case "verified":
      return "Verified";
    case "disputed":
      return "Disputed";
    case "needs-review":
      return "Needs Review";
    default:
      return verdict;
  }
}

/**
 * Get color for verdict badge
 */
export function getVerdictColor(verdict: FactCheckVerdict): {
  bg: string;
  text: string;
} {
  switch (verdict) {
    case "verified":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "disputed":
      return { bg: "bg-red-100", text: "text-red-700" };
    case "in-progress":
    case "needs-review":
      return { bg: "bg-yellow-100", text: "text-yellow-700" };
    case "queued":
      return { bg: "bg-gray-100", text: "text-gray-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}

/**
 * Get icon for verdict
 */
export function getVerdictIcon(
  verdict: FactCheckVerdict
): "verified" | "disputed" | "pending" | "review" {
  switch (verdict) {
    case "verified":
      return "verified";
    case "disputed":
      return "disputed";
    case "in-progress":
    case "needs-review":
      return "review";
    case "queued":
    default:
      return "pending";
  }
}

/**
 * Check if verdict is a final state (cannot be changed)
 */
export function isFinalVerdict(verdict: FactCheckVerdict): boolean {
  return verdict === "verified" || verdict === "disputed";
}

/**
 * Check if verdict can be reviewed by admin
 */
export function canBeReviewed(verdict: FactCheckVerdict): boolean {
  return verdict === "queued" || verdict === "needs-review";
}

/**
 * Check if verdict is in progress
 */
export function isInProgress(verdict: FactCheckVerdict): boolean {
  return verdict === "in-progress";
}
