/**
 * Integration tests for report submission flow
 */

import { supabase } from "../../lib/supabase";
import {
  validateReportDescription,
  validateReportTitle,
} from "../../lib/validation";
import { reportsService } from "../../services/supabaseService";

// Mock Supabase
jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("Report Submission Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate report data before submission", () => {
    const title = "Test Report";
    const description = "This is a test report description with enough text";

    const titleValidation = validateReportTitle(title);
    const descriptionValidation = validateReportDescription(description);

    expect(titleValidation.isValid).toBe(true);
    expect(descriptionValidation.isValid).toBe(true);
  });

  it("should create a report with valid data", async () => {
    const reportData = {
      title: "Test Report",
      description: "This is a test report description with enough text",
      location: "Test Location",
      user_id: "test-user-id",
      is_anonymous: false,
      status: "pending" as const,
    };

    // Mock successful report creation - properly chain all methods
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: { id: "test-id", ...reportData },
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: mockInsert,
    });

    const { data, error } = await reportsService.create(reportData);

    expect(error).toBe(null);
    expect(data).toBeDefined();
    expect(data?.title).toBe(reportData.title);
    expect(supabase.from).toHaveBeenCalledWith("reports");
  });
});
