-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chats table
CREATE TABLE chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    is_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES profiles(id) NOT NULL
);

-- Create chat_members table
CREATE TABLE chat_members (
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (chat_id, user_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT,
    type TEXT CHECK (type IN ('text', 'image', 'file')) DEFAULT 'text',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chats policies
CREATE POLICY "Users can view their chats" 
ON chats FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_members 
        WHERE chat_id = id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create chats" 
ON chats FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Chat members policies
CREATE POLICY "Users can view members of their chats" 
ON chat_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_members AS cm 
        WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Chat admins can manage members" 
ON chat_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM chat_members 
        WHERE chat_id = chat_members.chat_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Messages policies
CREATE POLICY "Users can view messages in their chats" 
ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_members 
        WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages to their chats" 
ON messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_members 
        WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
);

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
