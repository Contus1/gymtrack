'use client'

import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dumbbell, LogOut, TrendingUp, Users, Calendar, Plus } from 'lucide-react'
import WorkoutLogger from '../components/WorkoutLogger'
import FriendWorkoutModal from '../components/FriendWorkoutModal'
// import AIFeedback from '../components/AIFeedback'
import WorkoutCalendar from '../components/WorkoutCalendar'

interface Profile {
  id: string
  full_name: string | null
  current_streak: number
  longest_streak: number
  total_workouts: number
  last_workout_date: string | null
}

interface Workout {
  id: string
  body_part: string
  mood_rating: number
  intensity: number | null
  notes: string | null
  struggles: string | null
  workout_date: string
  created_at: string
}

interface Friend {
  id: string
  full_name: string
  current_streak: number
  last_workout_date: string | null
  total_workouts: number
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Fetch or create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        let finalProfile = profileData

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || null,
              current_streak: 0,
              longest_streak: 0,
              total_workouts: 0,
              last_workout_date: null
            })
            .select()
            .single()

          if (createError) throw createError
          finalProfile = newProfile
        } else if (profileError) {
          throw profileError
        }

        setProfile(finalProfile)

        // Fetch recent workouts
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('workout_date', { ascending: false })
          .limit(5)

        if (workoutError) throw workoutError
        setRecentWorkouts(workoutData || [])

        // Fetch friends (placeholder for now)
        // TODO: Implement actual friends functionality
        setFriends([])

      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      fetchUserData()
    }
  }, [user, loading, router, refreshKey])

  const handleWorkoutLogged = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Navigation */}
      <nav className="backdrop-blur-xl border-b sticky top-0 z-40" style={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Dumbbell className="w-4 h-4" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-xl font-semibold text-white">Gym Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/60 hidden sm:block">
                {profile.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full transition-colors hover:bg-white/5"
              >
                <LogOut className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {profile.full_name?.split(' ')[0] || 'Champion'}! 💪
          </h1>
          <p className="text-white/60 text-lg">
            Ready to crush another workout? Let&apos;s keep that streak going.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Personal Streak */}
          <div className="backdrop-blur-sm rounded-2xl p-6 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-2xl font-bold text-white">🔥</span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Personal Streak</h3>
            <p className="text-2xl font-bold text-white">{profile.current_streak} days</p>
            <p className="text-white/40 text-xs mt-1">
              {profile.current_streak === 0 ? 'Log a workout to start!' : `Longest: ${profile.longest_streak} days`}
            </p>
          </div>

          {/* Last Workout */}
          <div className="backdrop-blur-sm rounded-2xl p-6 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Calendar className="w-6 h-6" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-2xl font-bold text-white">📅</span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Last Workout</h3>
            <p className="text-lg font-semibold text-white">
              {profile.last_workout_date ? new Date(profile.last_workout_date).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {profile.last_workout_date ? 'Keep the momentum!' : 'Time for your first workout!'}
            </p>
          </div>

          {/* Total Workouts */}
          <div className="backdrop-blur-sm rounded-2xl p-6 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Dumbbell className="w-6 h-6" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-2xl font-bold text-white">💪</span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Total Workouts</h3>
            <p className="text-2xl font-bold text-white">{profile.total_workouts}</p>
            <p className="text-white/40 text-xs mt-1">Every rep counts!</p>
          </div>

          {/* Friends */}
          <div className="backdrop-blur-sm rounded-2xl p-6 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Users className="w-6 h-6" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-2xl font-bold text-white">👥</span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Friends</h3>
            <p className="text-2xl font-bold text-white">{friends.length}/6</p>
            <p className="text-white/40 text-xs mt-1">Connect with gym buddies</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Log Today's Workout */}
          <div className="backdrop-blur-sm rounded-2xl p-8 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Plus className="w-7 h-7" style={{ color: '#00C08B' }} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Log Today&apos;s Workout</h3>
                <p className="text-white/60">Track your progress and keep your streak alive</p>
              </div>
            </div>
            <button
              onClick={() => setShowWorkoutLogger(true)}
              className="w-full py-3 rounded-xl font-semibold text-black transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#00C08B' }}
            >
              Start Logging
            </button>
          </div>

          {/* AI Feedback */}
          <div className="backdrop-blur-sm rounded-2xl p-8 border" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                 borderColor: 'rgba(255, 255, 255, 0.08)' 
               }}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">AI Feedback</h3>
                <p className="text-white/60">
                  {profile.current_streak > 0 
                    ? `🔥 ${profile.current_streak} day streak! Keep going!`
                    : profile.total_workouts === 0
                    ? "Welcome! Log your first workout to get started."
                    : "Ready for your next workout?"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Calendar */}
        <div className="mb-12">
          <WorkoutCalendar userId={user.id} />
        </div>

        {/* Recent Activity */}
        <div className="backdrop-blur-sm rounded-2xl p-8 border" 
             style={{ 
               backgroundColor: 'rgba(255, 255, 255, 0.02)', 
               borderColor: 'rgba(255, 255, 255, 0.08)' 
             }}>
          <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" 
                   style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <Calendar className="w-10 h-10 text-white/40" />
              </div>
              <p className="text-white/60 text-lg mb-2">No workouts yet</p>
              <p className="text-white/40">Your workout history will appear here once you start logging.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                         style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                      <span className="text-lg">💪</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium capitalize">
                        {workout.body_part.replace('_', ' ')}
                      </h4>
                      <p className="text-white/60 text-sm">
                        {new Date(workout.workout_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {workout.mood_rating === 5 ? '😄' : 
                       workout.mood_rating === 4 ? '😊' : 
                       workout.mood_rating === 3 ? '😐' : 
                       workout.mood_rating === 2 ? '😕' : '😤'}
                    </span>
                    {workout.intensity && (
                      <span className="text-white/60 text-sm">
                        {workout.intensity}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Workout Logger Modal */}
      <WorkoutLogger
        isOpen={showWorkoutLogger}
        onClose={() => setShowWorkoutLogger(false)}
        onWorkoutLogged={handleWorkoutLogged}
      />

      {/* Friend Workout Modal */}
      <FriendWorkoutModal
        friend={selectedFriend}
        isOpen={!!selectedFriend}
        onClose={() => setSelectedFriend(null)}
      />
    </div>
  )
}
