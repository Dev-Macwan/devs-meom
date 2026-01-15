-- Create profiles table with user details including nickname and DOB
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    nickname TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    mother_photo_url TEXT,
    umiya_maa_photo_url TEXT,
    preferred_language TEXT DEFAULT 'hinglish',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diary entries table
CREATE TABLE public.diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('diary', 'best_part', 'worst_part', 'tomorrow_tasks')),
    content TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    maa_reply_requested BOOLEAN DEFAULT FALSE,
    maa_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table for tomorrow's tasks
CREATE TABLE public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_time TIME,
    is_completed BOOLEAN DEFAULT FALSE,
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prayers table for Umiya Maa section
CREATE TABLE public.prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prayer_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table for Talk to Mummy
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'mummy')),
    content TEXT NOT NULL,
    mood_detected TEXT,
    is_night_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily messages table for Maa's daily messages
CREATE TABLE public.daily_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    message_date DATE NOT NULL DEFAULT CURRENT_DATE,
    context_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, message_date)
);

-- Create private vault for photos
CREATE TABLE public.private_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    original_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for diary_entries
CREATE POLICY "Users can view own diary entries" ON public.diary_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diary entries" ON public.diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary entries" ON public.diary_entries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary entries" ON public.diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_tasks
CREATE POLICY "Users can view own tasks" ON public.user_tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.user_tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.user_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prayers
CREATE POLICY "Users can view own prayers" ON public.prayers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prayers" ON public.prayers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayers" ON public.prayers
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_messages
CREATE POLICY "Users can view own daily messages" ON public.daily_messages
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily messages" ON public.daily_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for private_vault
CREATE POLICY "Users can view own vault" ON public.private_vault
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own vault" ON public.private_vault
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from own vault" ON public.private_vault
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();