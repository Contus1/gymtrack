'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Dumbbell, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user && !data.user.email_confirmed_at) {
        setMessage('Check your email for the confirmation link!')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', borderBottomColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                  <Dumbbell className="w-4 h-4" style={{ color: '#00C08B' }} />
                </div>
                <span className="text-xl font-semibold text-white">Gym Tracker</span>
              </Link>
              <Link 
                href="/login"
                className="px-6 py-2 rounded-full text-black font-medium transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#00C08B' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 transition-colors mb-6 sm:mb-8 hover:text-white"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to home</span>
              </Link>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8" 
                   style={{ background: 'rgba(0, 192, 139, 0.15)' }}>
                <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#00C08B' }} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Start your journey
              </h1>
              <p className="text-white/60">
                Create your account and begin tracking your fitness goals
              </p>
            </div>

            {/* Signup Form */}
            <div className="backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-10 border" 
                 style={{ 
                   backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                   borderColor: 'rgba(255, 255, 255, 0.08)',
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                 }}>
              
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10">
                  <p className="text-green-400 text-sm">{message}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C08B] focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C08B] focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C08B] focus:border-transparent transition-all"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00C08B] focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 rounded-xl font-semibold text-black transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: '#00C08B' }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-white/60">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium hover:underline"
                  style={{ color: '#00C08B' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
