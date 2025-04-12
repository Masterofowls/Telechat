import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface ReactionCount {
  emoji: string;
  count: number;
  users: string[];
}

export function useReactions(messageId?: string) {
  const { supabase } = useSupabase();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and subscribe to reactions
  useEffect(() => {
    if (!messageId) {
      setLoading(false);
      return;
    }

    const fetchReactions = async () => {
      try {
        const { data, error } = await supabase
          .from('message_reactions')
          .select('*')
          .eq('message_id', messageId);

        if (error) throw error;
        setReactions(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reactions:', err);
        setLoading(false);
      }
    };

    fetchReactions();

    // Subscribe to reaction changes
    const subscription = supabase
      .channel(`reactions:${messageId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'message_reactions', filter: `message_id=eq.${messageId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setReactions(current => 
              current.filter(r => r.id !== (payload.old as Reaction).id)
            );
          } else if (payload.eventType === 'INSERT') {
            setReactions(current => [...current, payload.new as Reaction]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [messageId, supabase]);

  // Toggle reaction
  const toggleReaction = async (emoji: string) => {
    if (!messageId) return { error: new Error('No message ID provided') };

    try {
      const { data, error } = await supabase
        .rpc('toggle_reaction', {
          p_message_id: messageId,
          p_emoji: emoji
        });

      if (error) throw error;
      return { data };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Get grouped reactions
  const getReactionCounts = (): ReactionCount[] => {
    const counts = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { emoji: reaction.emoji, count: 0, users: [] };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user_id);
      return acc;
    }, {} as Record<string, ReactionCount>);

    return Object.values(counts);
  };

  return {
    reactions,
    loading,
    toggleReaction,
    getReactionCounts
  };
}
