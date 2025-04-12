import React from 'react';
import { FiDownload, FiFile, FiFileText, FiImage } from 'react-icons/fi';
import { Button } from './ui/Button';

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  className?: string;
}

export default function FilePreview({
  fileName,
  fileType,
  fileSize,
  fileUrl,
  className = ''
}: FilePreviewProps) {
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';
  const isText = fileType === 'text/plain';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = () => {
    if (isImage) return <FiImage className="w-6 h-6" />;
    if (isPdf || isText) return <FiFileText className="w-6 h-6" />;
    return <FiFile className="w-6 h-6" />;
  };

  return (
    <div role="article" className={`flex items-center space-x-3 p-3 rounded-lg border border-border ${className}`}>
      {isImage ? (
        <img
          src={fileUrl}
          alt={fileName}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-accent rounded">
          {getFileIcon()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)}
        </p>
      </div>

      <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          <FiDownload className="w-4 h-4" />
        </Button>
      </a>
    </div>
  );
}
