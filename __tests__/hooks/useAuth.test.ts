/**
 * Unit tests for useAuth hook
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

// Mock Supabase
jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn(),
    },
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it("should set user when authenticated", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("should handle authentication errors", async () => {
    const mockError = new Error("Authentication failed");
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
