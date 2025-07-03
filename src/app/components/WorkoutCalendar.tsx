'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Workout {
  id: string;
  date: string;
  body_part: string;
  mood: number;
}

interface WorkoutCalendarProps {
  userId?: string;
}

export default function WorkoutCalendar({ userId }: WorkoutCalendarProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchWorkouts();
  }, [userId, currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      
      // Get current user if no userId provided
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        effectiveUserId = user.id;
      }
      
      // Get workouts for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id, body_part, mood_rating, workout_date')
        .eq('user_id', effectiveUserId)
        .gte('workout_date', startOfMonth.toISOString().split('T')[0])
        .lte('workout_date', endOfMonth.toISOString().split('T')[0])
        .order('workout_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match component interface
      const transformedWorkouts = (data || []).map(workout => ({
        id: workout.id,
        date: workout.workout_date,
        body_part: workout.body_part,
        mood: workout.mood_rating
      }));
      
      setWorkouts(transformedWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getWorkoutForDate = (day: number | null) => {
    if (!day) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.find(w => w.date === dateStr);
  };

  const getMoodColor = (mood: number) => {
    switch (mood) {
      case 1: return 'bg-red-200 border-red-300';
      case 2: return 'bg-orange-200 border-orange-300';
      case 3: return 'bg-yellow-200 border-yellow-300';
      case 4: return 'bg-green-200 border-green-300';
      case 5: return 'bg-emerald-200 border-emerald-300';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth().map((day, index) => {
          const workout = getWorkoutForDate(day);
          const hasWorkout = !!workout;
          const todayClass = isToday(day) ? 'ring-2 ring-blue-500' : '';
          
          return (
            <div key={index} className="aspect-square">
              {day ? (
                <div 
                  className={`
                    w-full h-full flex items-center justify-center text-sm rounded-lg border-2 transition-all
                    ${hasWorkout 
                      ? `${getMoodColor(workout.mood)} cursor-pointer hover:scale-105` 
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }
                    ${todayClass}
                  `}
                  title={hasWorkout ? `${workout.body_part} - Mood: ${workout.mood}/5` : ''}
                >
                  <span className={`font-medium ${hasWorkout ? 'text-gray-700' : 'text-gray-400'}`}>
                    {day}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Workout Days</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-red-200 border border-red-300" title="Mood 1-2"></div>
              <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300" title="Mood 3"></div>
              <div className="w-3 h-3 rounded bg-green-200 border border-green-300" title="Mood 4-5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
