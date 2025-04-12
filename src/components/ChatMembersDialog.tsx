import React from 'react';
import { FiX, FiUserPlus } from 'react-icons/fi';
import { Button } from './ui/Button';
import ProfileCard from './ProfileCard';
import type { Chat, ChatMember } from '../lib/supabase';

interface ChatMembersDialogProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  members: ChatMember[];
}

export default function ChatMembersDialog({
  open,
  onClose,
  chat,
  members
}: ChatMembersDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background rounded-lg shadow-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium">Chat Members</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between"
              >
                <ProfileCard userId={member.user_id} />
                <span className="text-sm text-muted-foreground capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {chat.is_group && (
            <Button
              className="w-full mt-6"
              variant="outline"
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              Add Members
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
