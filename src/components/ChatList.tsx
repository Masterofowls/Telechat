import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useSupabase } from '../hooks/useSupabase';
import ProfileCard from './ProfileCard';
import type { Chat } from '../lib/supabase';
import NewChatDialog from './NewChatDialog';

interface ChatListProps {
  activeChatId?: string;
}

export default function ChatList({ activeChatId }: ChatListProps) {
  const { supabase, user } = useSupabase();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*, chat_members!inner(*)')
          .eq('chat_members.user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChats(data || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to new chats
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_members', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, user]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-secondary animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewChat(true)}
          >
            <FiPlus className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredChats.map(chat => (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className={`block p-3 rounded-md hover:bg-accent transition-colors ${
                chat.id === activeChatId ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.title}</div>
                  {chat.is_group && (
                    <div className="text-sm text-muted-foreground">
                      Group · {chat.chat_members.length} members
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <NewChatDialog
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
      />
    </>
  );
}
