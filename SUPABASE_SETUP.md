# 🔧 Supabase Setup Instructions

Your Gym Tracker app is connected to Supabase project: `dlcmdmxfhoqtxwbxhatb`

## Step 1: Get Your API Keys

1. **Go to your Supabase dashboard:**
   https://supabase.com/dashboard/project/dlcmdmxfhoqtxwbxhatb

2. **Navigate to Settings → API**

3. **Copy these values:**
   - `Project URL` (starts with https://dlcmdmxfhoqtxwbxhatb.supabase.co)
   - `anon public` key (long string starting with eyJ...)

4. **Update your `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://dlcmdmxfhoqtxwbxhatb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## Step 2: Set Up Database Tables

1. **Go to SQL Editor in your Supabase dashboard:**
   https://supabase.com/dashboard/project/dlcmdmxfhoqtxwbxhatb/sql

2. **Copy and paste the contents of `supabase-schema.sql`**
   (The file is already created in your project root)

3. **Run the SQL** to create all tables and security policies

## Step 3: Enable Authentication

1. **Go to Authentication → Settings**
   https://supabase.com/dashboard/project/dlcmdmxfhoqtxwbxhatb/auth/settings

2. **Enable Email confirmation if desired**

3. **Set Site URL to your domain** (for production)

## What Gets Created:

### 📊 **Database Tables:**
- `profiles` - User profiles with streak data
- `workouts` - Individual workout logs
- `friendships` - Friend connections (max 6)
- `ai_feedback` - AI recommendations and feedback

### 🔒 **Security:**
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic profile creation on signup

### ⚡ **Triggers:**
- Auto-create profile when user signs up
- Auto-calculate streaks when workouts are logged
- Auto-reset streaks after 3+ days inactivity

## Step 4: Test Your App

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Sign up for a new account**

3. **Log your first workout** and watch the magic happen! ✨

## 🚀 Features Working:

✅ **User Authentication** (signup/login)
✅ **Workout Logging** (body parts, mood, intensity, notes)
✅ **Streak Tracking** (auto-calculated, resets after 3 days)
✅ **Smart AI Feedback** (praise, warnings, suggestions)
✅ **Recent Activity** (last 5 workouts with details)
✅ **PWA Support** (installable on mobile)
✅ **Clean Mobile Design** (Apple/Notion inspired)

## 🔜 Next Features to Add:
- Friends system with workout sharing
- Calendar/timeline view
- Workout intensity analysis
- Push notifications for streak maintenance
- Export workout data

---

**Your gym tracker is ready to crush some fitness goals! 💪**
