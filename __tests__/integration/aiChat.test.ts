/**
 * Integration tests for AI Chat service
 * Tests Edge Function wrapper and error handling
 */

import { sendChatMessage } from '../../lib/apiService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('AI Chat Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('should successfully send chat message and receive response', async () => {
      const mockMessage = 'Hello, how are you?';
      const mockHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      const mockResponse = {
        message: 'Hello! I am doing well, thank you for asking.',
        usage: {
          prompt_tokens: 20,
          completion_tokens: 15,
          total_tokens: 35,
        },
      };

      // Mock successful Edge Function response
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const result = await sendChatMessage(mockMessage, mockHistory);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe(mockResponse.message);
      expect(result.data?.usage).toEqual(mockResponse.usage);
      expect(result.error).toBeUndefined();

      // Verify correct function call
      expect(supabase.functions.invoke).toHaveBeenCalledWith('chat', {
        body: {
          message: mockMessage,
          history: mockHistory,
        },
      });
    });

    it('should handle Edge Function errors gracefully', async () => {
      const mockMessage = 'Test message';

      // Mock Edge Function error (e.g., function not deployed)
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Function not found',
          status: 404,
        },
      });

      const result = await sendChatMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('not deployed');
      expect(result.data).toBeUndefined();
    });

    it('should handle missing OpenAI API key error', async () => {
      const mockMessage = 'Test message';

      // Mock API key not configured error
      (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
        data: { error: 'OPENAI_API_KEY not configured' },
        error: null,
      });

      const result = await sendChatMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('not configured');
    });

    it('should handle network errors', async () => {
      const mockMessage = 'Test message';

      // Mock network failure
      (supabase.functions.invoke as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      const result = await sendChatMessage(mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Chat failed');
    });
  });
});

