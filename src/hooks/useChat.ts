import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import type { Message, Chat, ChatMember } from '../lib/supabase';

export function useChat(chatId?: string) {
  const { supabase, user } = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat details and members
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    const fetchChatDetails = async () => {
      try {
        // Get chat details
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (chatError) throw chatError;
        setChat(chatData);

        // Get chat members
        const { data: membersData, error: membersError } = await supabase
          .from('chat_members')
          .select('*')
          .eq('chat_id', chatId);

        if (membersError) throw membersError;
        setMembers(membersData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchChatDetails();
  }, [chatId, supabase]);

  // Fetch and subscribe to messages
  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages(current => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, supabase]);

  interface SendMessageOptions {
    type: 'text' | 'image' | 'file';
    content: string;
    file_path?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
  }

  // Send message
  const sendMessage = async (options: SendMessageOptions | string) => {
    if (!chatId || !user) return { error: new Error('No chat or user') };

    try {
      const messageData = typeof options === 'string' ? {
        type: 'text' as const,
        content: options,
      } : options;

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          sender_id: user.id,
          ...messageData,
          file_url: messageData.type === 'file' ? messageData.file_path : undefined
        }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Create new chat
  const createChat = async (title: string, memberIds: string[], isGroup = false) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([{
          title,
          is_group: isGroup,
          created_by: user.id
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members
      const members = [...new Set([...memberIds, user.id])].map(userId => ({
        chat_id: chatData.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) throw membersError;

      return { data: chatData };
    } catch (err: any) {
      return { error: err };
    }
  };

  return {
    messages,
    chat,
    members,
    loading,
    error,
    sendMessage,
    createChat
  };
}
