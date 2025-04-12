import React from 'react';
import { useProfile } from '../hooks/useProfile';
import anime from 'animejs';

interface TypingIndicatorProps {
  userIds: string[];
}

export default function TypingIndicator({ userIds }: TypingIndicatorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [typingText, setTypingText] = React.useState('');

  // Get the first user's profile (we'll only show one name even if multiple are typing)
  const { profile } = useProfile(userIds[0]);

  React.useEffect(() => {
    if (userIds.length === 0) {
      setTypingText('');
      return;
    }

    if (userIds.length === 1) {
      setTypingText(`${profile?.username || 'Someone'} is typing`);
    } else {
      setTypingText(`${userIds.length} people are typing`);
    }

    // Animate the dots
    if (containerRef.current) {
      anime({
        targets: '.typing-dot',
        translateY: [-3, 0],
        delay: anime.stagger(100),
        duration: 600,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutQuad'
      });
    }
  }, [userIds.length, profile]);

  if (userIds.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="flex items-center space-x-2 text-sm text-muted-foreground p-2"
    >
      <span>{typingText}</span>
      <div className="flex space-x-1">
        <div className="typing-dot w-1 h-1 rounded-full bg-primary"></div>
        <div className="typing-dot w-1 h-1 rounded-full bg-primary"></div>
        <div className="typing-dot w-1 h-1 rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
