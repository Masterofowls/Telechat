-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_files', 'chat_files', false);

-- Enable RLS on the bucket
CREATE POLICY "Users can view files from their chats"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'chat_files'
    AND (
        SELECT EXISTS (
            SELECT 1 FROM messages m
            JOIN chat_members cm ON m.chat_id = cm.chat_id
            WHERE m.file_path = storage.objects.name
            AND cm.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can upload files to their chats"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'chat_files'
    AND auth.role() = 'authenticated'
);

-- Update messages table to support file messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_type TEXT;
