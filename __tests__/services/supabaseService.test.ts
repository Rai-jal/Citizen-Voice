/**
 * Unit tests for Supabase service layer
 */

import { supabase } from "../../lib/supabase";
import {
  newsService,
  opportunitiesService,
  servicesService,
} from "../../services/supabaseService";

// Mock Supabase
jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

describe("Supabase Service Layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("newsService", () => {
    it("should fetch all news", async () => {
      const mockNews = [
        { id: "1", title: "News 1", summary: "Summary 1", date: "2024-01-01" },
        { id: "2", title: "News 2", summary: "Summary 2", date: "2024-01-02" },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockNews,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { data, error } = await newsService.getAll();

      expect(data).toEqual(mockNews);
      expect(error).toBe(null);
    });

    it("should handle errors when fetching news", async () => {
      const mockError = new Error("Database error");
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { data, error } = await newsService.getAll();

      expect(data).toEqual([]);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("servicesService", () => {
    it("should fetch all services", async () => {
      const mockServices = [
        { id: "1", name: "Service 1", description: "Description 1" },
        { id: "2", name: "Service 2", description: "Description 2" },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockServices,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { data, error } = await servicesService.getAll();

      expect(data).toEqual(mockServices);
      expect(error).toBe(null);
    });
  });

  describe("opportunitiesService", () => {
    it("should fetch all opportunities", async () => {
      const mockOpportunities = [
        {
          id: "1",
          title: "Opportunity 1",
          description: "Description 1",
          organization: "Org 1",
          deadline: "2024-12-31",
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockOpportunities,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      const { data, error } = await opportunitiesService.getAll();

      expect(data).toEqual(mockOpportunities);
      expect(error).toBe(null);
    });
  });
});
