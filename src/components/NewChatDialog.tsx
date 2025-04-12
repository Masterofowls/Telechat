import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSearch } from 'react-icons/fi';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useSupabase } from '../hooks/useSupabase';
import { useChat } from '../hooks/useChat';
import ProfileCard from './ProfileCard';
import type { Profile } from '../lib/supabase';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const { supabase, user } = useSupabase();
  const { createChat } = useChat();
  const navigate = useNavigate();
  const [step, setStep] = useState<'type' | 'users'>('type');
  const [isGroup, setIsGroup] = useState(false);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (searchQuery) {
      const searchUsers = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user?.id)
          .ilike('username', `%${searchQuery}%`)
          .limit(10);

        if (!error && data) {
          setUsers(data);
        }
      };

      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery, supabase, user?.id]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const chatTitle = isGroup 
        ? title 
        : selectedUsers[0]?.username || 'Chat';
      
      const { data, error } = await createChat(
        chatTitle,
        selectedUsers.map(u => u.id),
        isGroup
      );

      if (error) throw error;
      navigate(`/chat/${data.id}`);
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background rounded-lg shadow-lg border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium">
            {step === 'type' ? 'New Chat' : 'Add Participants'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          {step === 'type' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chat Type
                </label>
                <div className="space-x-4">
                  <Button
                    variant={!isGroup ? 'default' : 'outline'}
                    onClick={() => setIsGroup(false)}
                  >
                    Direct Message
                  </Button>
                  <Button
                    variant={isGroup ? 'default' : 'outline'}
                    onClick={() => setIsGroup(true)}
                  >
                    Group Chat
                  </Button>
                </div>
              </div>

              {isGroup && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter group name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => setStep('users')}
                disabled={isGroup && !title}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-accent rounded-full px-3 py-1"
                    >
                      <span className="text-sm">{user.username}</span>
                      <button
                        onClick={() => setSelectedUsers(current =>
                          current.filter(u => u.id !== user.id)
                        )}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="max-h-64 overflow-y-auto space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => {
                      if (!isGroup && selectedUsers.length === 1) return;
                      setSelectedUsers(current =>
                        current.some(u => u.id === user.id)
                          ? current.filter(u => u.id !== user.id)
                          : [...current, user]
                      );
                    }}
                  >
                    <ProfileCard userId={user.id} />
                    {selectedUsers.some(u => u.id === user.id) && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('type')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={selectedUsers.length === 0 || loading}
                >
                  {loading ? 'Creating...' : 'Create Chat'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
