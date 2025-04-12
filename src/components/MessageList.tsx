import React from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Message } from '../lib/supabase';
import ProfileCard from './ProfileCard';
import MessageReactions from './MessageReactions';
import FilePreview from './FilePreview';
import { format } from 'date-fns';
import { FiPaperclip } from 'react-icons/fi';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useSupabase();

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === user?.id;
    const time = format(new Date(message.created_at), 'HH:mm');

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isOwn && (
            <div className="flex-shrink-0">
              <ProfileCard userId={message.sender_id} showStatus={false} />
            </div>
          )}

          <div>
            <div className={`group relative ${
              isOwn ? 'bg-primary text-primary-foreground' : 'bg-accent'
            } rounded-lg px-3 py-2`}>
            {message.type === 'text' ? (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : message.type === 'file' ? (
              <FilePreview
                fileName={message.file_name!}
                fileType={message.file_type!}
                fileSize={message.file_size!}
                fileUrl={message.file_url!}
                className={isOwn ? 'bg-primary/10' : 'bg-accent/10'}
              />
            ) : null}

            {message.type === 'image' && (
              <img
                src={message.file_url}
                alt={message.content}
                className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.file_url, '_blank')}
              />
            )}

            {message.type === 'file' && (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm hover:underline"
              >
                <FiPaperclip className="w-4 h-4" />
                <span>{message.content}</span>
              </a>
            )}

            <span className="absolute bottom-0 ${
              isOwn ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'
            } opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
              {time}
            </span>
          </div>
            <div className="mt-1">
              <MessageReactions messageId={message.id} align={isOwn ? 'right' : 'left'} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map(message => renderMessage(message))}
    </div>
  );
}
