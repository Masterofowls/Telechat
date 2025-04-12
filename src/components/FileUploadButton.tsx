import React, { useRef } from 'react';
import { Button } from './ui/Button';
import { FiPaperclip } from 'react-icons/fi';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadButtonProps {
  chatId: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

export default function FileUploadButton({
  chatId,
  onFileSelect,
  disabled
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProgress } = useFileUpload();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 50MB limit');
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    })) {
      alert('File type not allowed');
      return;
    }

    onFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Find if there's any ongoing upload
  const isUploading = Object.values(uploadProgress).some(p => p.uploading);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_TYPES.join(',')}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="relative"
      >
        <FiPaperclip className="w-5 h-5" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </Button>
    </>
  );
}
