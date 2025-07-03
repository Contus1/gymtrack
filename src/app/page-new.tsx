'use client'

import { useAuth } from './components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, TrendingUp, Users, Calendar, Brain, Zap } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  // If user is logged in, redirect to dashboard
  if (user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Navigation */}
      <nav className="backdrop-blur-xl border-b sticky top-0 z-50" style={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Dumbbell className="w-4 h-4" style={{ color: '#00C08B' }} />
              </div>
              <span className="text-xl font-semibold text-white">Gym Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full text-black font-medium transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#00C08B' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-16 sm:mb-24">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-8 sm:mb-12" 
               style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#00C08B' }} />
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Track Your
            <br />
            <span style={{ color: '#00C08B' }}>Fitness Journey</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/60 mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed">
            A clean, minimalistic gym tracker to log workouts, track streaks, and stay motivated with friends. 
            No clutter, just pure focus on your fitness goals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-black font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: '#00C08B' }}
            >
              Start Tracking
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg transition-all duration-300 hover:bg-white/5 hover:border-white/30"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <TrendingUp className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Track Streaks</h3>
            <p className="text-white/60 leading-relaxed">
              Build momentum with personal workout streaks. Stay consistent and watch your progress grow.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <Users className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Friend Streaks</h3>
            <p className="text-white/60 leading-relaxed">
              Connect with up to 6 friends and motivate each other to maintain your fitness routines.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <Calendar className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Visual Timeline</h3>
            <p className="text-white/60 leading-relaxed">
              See your active and rest days at a glance with a clean, intuitive calendar view.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <Brain className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">AI Feedback</h3>
            <p className="text-white/60 leading-relaxed">
              Get personalized encouragement, warnings, and workout recommendations powered by AI.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <Zap className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Mobile First</h3>
            <p className="text-white/60 leading-relaxed">
              Install as a PWA on your phone for quick workout logging wherever you are.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
              <Dumbbell className="w-8 h-8" style={{ color: '#00C08B' }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Simple Logging</h3>
            <p className="text-white/60 leading-relaxed">
              Log workouts with body parts, mood, and notes. Clean interface, maximum focus.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24 sm:mt-32">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your fitness routine?
          </h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have made fitness tracking simple and effective.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-full text-black font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: '#00C08B' }}
          >
            Start Your Journey
          </Link>
        </div>
      </main>
    </div>
  )
}
