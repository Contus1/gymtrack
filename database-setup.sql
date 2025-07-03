-- COMPLETE DATABASE SCHEMA FOR GYM TRACKER
-- Copy and paste this entire file into your Supabase SQL Editor
-- Run it all at once to set up your database

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body_part TEXT NOT NULL CHECK (body_part IN ('arms', 'legs', 'back', 'chest', 'shoulders', 'abs', 'cardio', 'full-body')),
  mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
  notes TEXT,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'intense')),
  struggles TEXT,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create workout streaks table
CREATE TABLE IF NOT EXISTS workout_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  streak_broken_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts policies
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view friends workouts" ON workouts;
CREATE POLICY "Users can view friends workouts" ON workouts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT friend_id FROM friends 
      WHERE user_id = workouts.user_id AND status = 'accepted'
      UNION
      SELECT user_id FROM friends 
      WHERE friend_id = workouts.user_id AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Friends policies
DROP POLICY IF EXISTS "Users can view own friends" ON friends;
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert friend requests" ON friends;
CREATE POLICY "Users can insert friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update friend status" ON friends;
CREATE POLICY "Users can update friend status" ON friends
  FOR UPDATE USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Workout streaks policies
DROP POLICY IF EXISTS "Users can view own streak" ON workout_streaks;
CREATE POLICY "Users can view own streak" ON workout_streaks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view friends streaks" ON workout_streaks;
CREATE POLICY "Users can view friends streaks" ON workout_streaks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT friend_id FROM friends 
      WHERE user_id = workout_streaks.user_id AND status = 'accepted'
      UNION
      SELECT user_id FROM friends 
      WHERE friend_id = workout_streaks.user_id AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Users can update own streak" ON workout_streaks;
CREATE POLICY "Users can update own streak" ON workout_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  
  INSERT INTO public.workout_streaks (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update streak when workout is logged
CREATE OR REPLACE FUNCTION public.update_workout_streak()
RETURNS TRIGGER AS $$
DECLARE
  user_streak_record workout_streaks%ROWTYPE;
  days_since_last INTEGER;
BEGIN
  -- Get current streak record
  SELECT * INTO user_streak_record
  FROM workout_streaks
  WHERE user_id = NEW.user_id;
  
  -- Calculate days since last workout
  IF user_streak_record.last_workout_date IS NULL THEN
    days_since_last := 0;
  ELSE
    days_since_last := NEW.workout_date - user_streak_record.last_workout_date;
  END IF;
  
  -- Update streak based on days since last workout
  IF days_since_last = 0 THEN
    -- Same day workout, don't change streak
    UPDATE workout_streaks
    SET last_workout_date = NEW.workout_date,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF days_since_last = 1 THEN
    -- Consecutive day, increment streak
    UPDATE workout_streaks
    SET current_streak = user_streak_record.current_streak + 1,
        longest_streak = GREATEST(user_streak_record.longest_streak, user_streak_record.current_streak + 1),
        last_workout_date = NEW.workout_date,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF days_since_last > 3 THEN
    -- More than 3 days gap, reset streak
    UPDATE workout_streaks
    SET current_streak = 1,
        last_workout_date = NEW.workout_date,
        streak_broken_at = NOW(),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    -- 2-3 days gap, start new streak
    UPDATE workout_streaks
    SET current_streak = 1,
        last_workout_date = NEW.workout_date,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for workout streak updates
DROP TRIGGER IF EXISTS on_workout_created ON workouts;
CREATE TRIGGER on_workout_created
  AFTER INSERT ON workouts
  FOR EACH ROW EXECUTE PROCEDURE public.update_workout_streak();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_workout_streaks_user_id ON workout_streaks(user_id);
