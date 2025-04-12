import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfmtchztjzhqlxybkaxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbXRjaHp0anpocWx4eWJrYXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDgxOTQsImV4cCI6MjA2MDAyNDE5NH0.566OojXcYz8rRPDLtLtwJmCu4O75tIWTJbNlL6cGhuw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database schema
export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  status?: string;
  created_at: string;
};

export type Chat = {
  id: string;
  title: string;
  is_group: boolean;
  created_at: string;
  created_by: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  file_url?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
};

export type ChatMember = {
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};
