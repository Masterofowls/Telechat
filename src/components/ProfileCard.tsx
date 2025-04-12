import React from 'react';
import { FiUser } from 'react-icons/fi';
import type { Profile } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';

interface ProfileCardProps {
  userId: string;
  showStatus?: boolean;
  className?: string;
}

export default function ProfileCard({ userId, showStatus = true, className = '' }: ProfileCardProps) {
  const { profile, loading } = useProfile(userId);

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-secondary animate-pulse rounded" />
          {showStatus && <div className="h-3 w-16 bg-secondary animate-pulse rounded" />}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiUser className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <div className="font-medium">{profile.username}</div>
        {showStatus && profile.status && (
          <div className="text-sm text-muted-foreground">{profile.status}</div>
        )}
      </div>
    </div>
  );
}
