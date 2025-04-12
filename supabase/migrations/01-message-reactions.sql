-- Create message_reactions table
CREATE TABLE message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view reactions in their chats" 
ON message_reactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN chat_members cm ON m.chat_id = cm.chat_id
        WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can react to messages in their chats" 
ON message_reactions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM messages m
        JOIN chat_members cm ON m.chat_id = cm.chat_id
        WHERE m.id = message_id
        AND cm.user_id = auth.uid()
        AND auth.uid() = user_id
    )
);

CREATE POLICY "Users can remove their own reactions" 
ON message_reactions FOR DELETE USING (
    user_id = auth.uid()
);

-- Create function to toggle reaction
CREATE OR REPLACE FUNCTION toggle_reaction(
    p_message_id UUID,
    p_emoji TEXT
)
RETURNS SETOF message_reactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Try to delete existing reaction
    DELETE FROM message_reactions
    WHERE message_id = p_message_id
    AND user_id = auth.uid()
    AND emoji = p_emoji
    RETURNING *;

    -- If no rows were deleted, insert new reaction
    IF NOT FOUND THEN
        RETURN QUERY
        INSERT INTO message_reactions (message_id, user_id, emoji)
        VALUES (p_message_id, auth.uid(), p_emoji)
        RETURNING *;
    END IF;
END;
$$;
