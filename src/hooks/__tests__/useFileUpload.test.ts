import { renderHook } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';
import { useSupabase } from '../useSupabase';

jest.mock('../useSupabase');

describe('useFileUpload', () => {
  const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
  const mockChatId = 'test-chat-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupabase as jest.Mock).mockReturnValue({
      supabase: {
        storage: {
          from: jest.fn(() => ({
            upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
            getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test-file' } })),
            remove: jest.fn().mockResolvedValue({ error: null }),
          })),
        },
      },
    });
  });

  it('uploads file successfully', async () => {
    const { result } = renderHook(() => useFileUpload());

    const uploadResult = await result.current.uploadFile(mockFile, mockChatId);

    expect(uploadResult).toEqual({
      uploadId: expect.any(String),
      filePath: expect.any(String),
      fileName: 'test-file.txt',
      fileSize: mockFile.size,
      fileType: 'text/plain',
      publicUrl: 'https://example.com/test-file',
    });

    const mockSupabase = (useSupabase as jest.Mock)().supabase;
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('chat_files');
  });

  it('handles upload error', async () => {
    const mockError = new Error('Upload failed');
    (useSupabase as jest.Mock).mockReturnValueOnce({
      supabase: {
        storage: {
          from: jest.fn(() => ({
            upload: jest.fn().mockRejectedValueOnce(mockError),
            getPublicUrl: jest.fn(),
          })),
        },
      },
    });

    const { result } = renderHook(() => useFileUpload());

    await expect(
      result.current.uploadFile(mockFile, mockChatId)
    ).rejects.toThrow('Upload failed');
  });

  it('generates unique file paths', async () => {
    const { result } = renderHook(() => useFileUpload());

    const uploads = await Promise.all([
      result.current.uploadFile(mockFile, mockChatId),
      result.current.uploadFile(mockFile, mockChatId),
    ]);

    const [upload1, upload2] = uploads;
    expect(upload1.filePath).not.toBe(upload2.filePath);
  });
});
