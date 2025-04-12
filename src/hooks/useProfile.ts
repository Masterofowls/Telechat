import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import type { Profile } from '../lib/supabase';

export function useProfile(userId?: string) {
  const { supabase, user } = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get profile data
  useEffect(() => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to realtime profile changes
    const subscription = supabase
      .channel(`profile:${targetUserId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${targetUserId}` },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, user?.id, userId]);

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user?.id) return { error: new Error('No user logged in') };

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { data: publicUrl };
    } catch (err: any) {
      return { error: err };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
  };
}
