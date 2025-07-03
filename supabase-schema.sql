-- Gym Tracker Database Schema
-- Run this in your Supabase SQL editor

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    body_part TEXT NOT NULL CHECK (body_part IN (
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 
        'glutes', 'abs', 'cardio', 'full_body'
    )),
    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
    notes TEXT,
    struggles TEXT,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    last_workout_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Friends table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- AI feedback table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('praise', 'warning', 'suggestion', 'encouragement')),
    message TEXT NOT NULL,
    streak_days INTEGER,
    inactive_days INTEGER,
    shown BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE
    USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Friends policies
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships" ON friendships FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- AI feedback policies
CREATE POLICY "Users can view own feedback" ON ai_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback" ON ai_feedback FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak when workout is added
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_workout_date DATE;
    streak_count INTEGER;
BEGIN
    -- Get user's last workout date and current streak
    SELECT last_workout_date, current_streak 
    INTO last_workout_date, streak_count
    FROM profiles 
    WHERE id = NEW.user_id;
    
    -- Calculate new streak
    IF last_workout_date IS NULL THEN
        -- First workout
        streak_count := 1;
    ELSIF NEW.workout_date = CURRENT_DATE AND last_workout_date = CURRENT_DATE THEN
        -- Same day workout, don't increment streak
        streak_count := streak_count;
    ELSIF NEW.workout_date = last_workout_date + INTERVAL '1 day' OR 
          (last_workout_date >= CURRENT_DATE - INTERVAL '1 day' AND NEW.workout_date = CURRENT_DATE) THEN
        -- Consecutive day or today after yesterday
        streak_count := streak_count + 1;
    ELSIF NEW.workout_date = CURRENT_DATE AND last_workout_date < CURRENT_DATE - INTERVAL '2 days' THEN
        -- More than 2 days gap, reset streak
        streak_count := 1;
    END IF;
    
    -- Update profile
    UPDATE profiles 
    SET 
        current_streak = streak_count,
        longest_streak = GREATEST(longest_streak, streak_count),
        total_workouts = total_workouts + 1,
        last_workout_date = GREATEST(last_workout_date, NEW.workout_date),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_workout_created ON workouts;
CREATE TRIGGER on_workout_created
    AFTER INSERT ON workouts
    FOR EACH ROW EXECUTE FUNCTION public.update_user_streak();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS workouts_user_id_date_idx ON workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS profiles_streak_idx ON profiles(current_streak DESC);
CREATE INDEX IF NOT EXISTS friendships_user_friend_idx ON friendships(user_id, friend_id);
