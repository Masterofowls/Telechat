import React, { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useReactions } from '../hooks/useReactions';
import { Button } from './ui/Button';
import anime from 'animejs';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

interface MessageReactionsProps {
  messageId: string;
  align?: 'left' | 'right';
}

export default function MessageReactions({ messageId, align = 'left' }: MessageReactionsProps) {
  const { user } = useSupabase();
  const { loading, toggleReaction, getReactionCounts } = useReactions(messageId);
  const [showPicker, setShowPicker] = useState(false);
  const reactionCounts = getReactionCounts();

  const handleToggleReaction = async (emoji: string) => {
    const targetId = `reaction-${messageId}-${emoji}`;
    const element = document.getElementById(targetId);

    if (element) {
      anime({
        targets: element,
        scale: [1, 1.5, 1],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    }

    await toggleReaction(emoji);
    setShowPicker(false);
  };

  if (loading) return null;

  return (
    <div className={`relative ${align === 'right' ? 'flex flex-row-reverse' : ''}`}>
      <div className="flex items-center space-x-1">
        {reactionCounts.map(({ emoji, count, users }) => (
          <Button
            key={emoji}
            id={`reaction-${messageId}-${emoji}`}
            variant="ghost"
            size="sm"
            className={`px-2 py-1 text-xs rounded-full ${
              users.includes(user?.id || '') ? 'bg-accent' : ''
            }`}
            onClick={() => handleToggleReaction(emoji)}
          >
            <span className="mr-1">{emoji}</span>
            <span>{count}</span>
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="px-2 py-1 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowPicker(prev => !prev)}
        >
          +
        </Button>
      </div>

      {showPicker && (
        <div 
          className={`absolute bottom-full mb-2 bg-background border border-border rounded-lg shadow-lg p-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex gap-1">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                className="p-1 hover:bg-accent rounded transition-colors"
                onClick={() => handleToggleReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
