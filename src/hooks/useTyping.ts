import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from './useSupabase';
import debounce from 'lodash/debounce';

export function useTyping(chatId?: string) {
  const { supabase, user } = useSupabase();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Send typing status
  const sendTypingStatus = useCallback(
    debounce(async (isTyping: boolean) => {
      if (!chatId || !user) return;

      const payload = {
        user_id: user.id,
        chat_id: chatId,
        is_typing: isTyping,
      };

      await supabase.channel('typing').send({
        type: 'broadcast',
        event: 'typing',
        payload,
      });
    }, 500),
    [chatId, user, supabase]
  );

  // Listen for typing events
  useEffect(() => {
    if (!chatId || !user) return;

    const channel = supabase.channel('typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.chat_id !== chatId || payload.user_id === user.id) return;

        setTypingUsers(current => {
          const newSet = new Set(current);
          if (payload.is_typing) {
            newSet.add(payload.user_id);
          } else {
            newSet.delete(payload.user_id);
          }
          return newSet;
        });
      })
      .subscribe();

    // Clear typing status after inactivity
    const clearTypingInterval = setInterval(() => {
      setTypingUsers(new Set());
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(clearTypingInterval);
    };
  }, [chatId, user, supabase]);

  // Handle input changes
  const handleTyping = () => {
    if (!chatId || !user) return;
    sendTypingStatus(true);
    
    // Automatically clear typing status after delay
    setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

  return {
    typingUsers: Array.from(typingUsers),
    handleTyping,
  };
}
