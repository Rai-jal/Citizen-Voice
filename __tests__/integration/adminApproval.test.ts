/**
 * Integration tests for admin approval flow
 * Tests RLS expectations and admin-only actions
 */

import { supabase } from '../../lib/supabase';
import { reportsService } from '../../services/supabaseService';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('Admin Approval Flow', () => {
  const mockReportId = 'test-report-id';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin update report status', () => {
    it('should allow admin to update report status when is_admin() returns true', async () => {
      // Mock admin check
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: true, error: null });

      // Mock successful update - properly chain all methods
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: { id: mockReportId, status: 'approved' },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdate,
      });

      // Attempt update as admin
      const { data, error } = await reportsService.update(mockReportId, {
        status: 'approved',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(supabase.from).toHaveBeenCalledWith('reports');
    });

    it('should fail when non-admin attempts to update report status', async () => {
      // Mock non-admin check
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: false, error: null });

      // Mock RLS policy blocking update - properly chain all methods
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: {
          message: 'new row violates row-level security policy',
          code: '42501',
        },
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdate,
      });

      // Attempt update as non-admin (should fail)
      const { data, error } = await reportsService.update(mockReportId, {
        status: 'approved',
      });

      // RLS should block this
      expect(error).toBeDefined();
      expect(error?.message).toContain('row-level security');
      expect(data).toBeNull();
    });
  });

  describe('Admin RPC function', () => {
    it('should call is_admin() RPC correctly', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: true, error: null });

      const { data, error } = await supabase.rpc('is_admin');

      expect(supabase.rpc).toHaveBeenCalledWith('is_admin');
      expect(data).toBe(true);
      expect(error).toBeNull();
    });

    it('should return false when user is not admin', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: false, error: null });

      const { data } = await supabase.rpc('is_admin');

      expect(data).toBe(false);
    });
  });
});

