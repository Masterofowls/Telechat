import React, { useState } from 'react';
import { FiMoreVertical, FiUsers } from 'react-icons/fi';
import { Button } from './ui/Button';
import type { Chat, ChatMember } from '../lib/supabase';
import ProfileCard from './ProfileCard';
import ChatMembersDialog from './ChatMembersDialog';

interface ChatHeaderProps {
  chat: Chat;
  members: ChatMember[];
}

export default function ChatHeader({ chat, members }: ChatHeaderProps) {
  const [showMembers, setShowMembers] = useState(false);

  return (
    <>
      <div className="h-16 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="font-medium">{chat.title}</h2>
            {chat.is_group && (
              <div 
                className="text-sm text-muted-foreground cursor-pointer hover:underline"
                onClick={() => setShowMembers(true)}
              >
                {members.length} members
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {chat.is_group && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembers(true)}
            >
              <FiUsers className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <FiMoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ChatMembersDialog
        open={showMembers}
        onClose={() => setShowMembers(false)}
        chat={chat}
        members={members}
      />
    </>
  );
}
