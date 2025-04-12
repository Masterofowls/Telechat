import { useState } from 'react';
import { useSupabase } from './useSupabase';
import { v4 as uuidv4 } from 'uuid';

interface UploadProgress {
  progress: number;
  uploading: boolean;
  error?: Error;
}

export function useFileUpload() {
  const { supabase } = useSupabase();
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});

  const uploadFile = async (file: File, chatId: string) => {
    const uploadId = uuidv4();
    const filePath = `${chatId}/${uploadId}-${file.name}`;

    setUploadProgress(prev => ({
      ...prev,
      [uploadId]: { progress: 0, uploading: true }
    }));

    try {
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('chat_files')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [uploadId]: { progress: percent, uploading: true }
            }));
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat_files')
        .getPublicUrl(filePath);

      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: { progress: 100, uploading: false }
      }));

      return {
        uploadId,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        publicUrl
      };
    } catch (error: any) {
      setUploadProgress(prev => ({
        ...prev,
        [uploadId]: { progress: 0, uploading: false, error }
      }));
      throw error;
    }
  };

  const getFileUrl = (filePath: string) => {
    return supabase.storage
      .from('chat_files')
      .getPublicUrl(filePath)
      .data.publicUrl;
  };

  const deleteFile = async (filePath: string) => {
    const { error } = await supabase.storage
      .from('chat_files')
      .remove([filePath]);
    
    if (error) throw error;
  };

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    uploadProgress
  };
}
