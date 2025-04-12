import React, { useState, useRef } from 'react';
import { FiUser, FiCamera, FiEdit2 } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProfile } from '../hooks/useProfile';
import anime from 'animejs';

export default function Settings() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [status, setStatus] = useState(profile?.status || '');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setStatus(profile.status || '');
    }
  }, [profile]);

  React.useEffect(() => {
    // Animate the form entrance
    anime({
      targets: '.settings-form',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: 'easeOutCubic'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    const { error } = await updateProfile({
      username,
      status,
    });

    if (error) {
      setError(error.message);
      anime({
        targets: '.error-message',
        translateX: [10, -10, 10, -10, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    setUpdating(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setError('');

    const { error } = await uploadAvatar(file);

    if (error) {
      setError(error.message);
      anime({
        targets: '.error-message',
        translateX: [10, -10, 10, -10, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="settings-form max-w-2xl mx-auto space-y-8 opacity-0">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Profile Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your profile information
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div 
              className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden"
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="w-16 h-16 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FiCamera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Username can only contain letters, numbers, and underscores"
                />
              </div>

              <div className="relative">
                <FiEdit2 className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Status (optional)"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>

            {error && (
              <div className="error-message text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
