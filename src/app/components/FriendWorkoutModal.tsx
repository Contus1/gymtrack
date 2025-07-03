'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Friend {
  id: string;
  full_name: string;
  current_streak: number;
  last_workout_date: string | null;
  total_workouts: number;
}

interface Workout {
  id: string;
  body_part: string;
  mood: number;
  intensity: number | null;
  notes: string | null;
  struggles: string | null;
  date: string;
}

interface FriendWorkoutModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendWorkoutModal({ friend, isOpen, onClose }: FriendWorkoutModalProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (friend && isOpen) {
      fetchFriendWorkouts();
    }
  }, [friend, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFriendWorkouts = async () => {
    if (!friend) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, body_part, mood, intensity, notes, struggles, date')
        .eq('user_id', friend.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching friend workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return '😤';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '😄';
      default: return '😐';
    }
  };

  if (!isOpen || !friend) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{friend.full_name}</h2>
            <p className="text-sm text-gray-600">
              {friend.current_streak} day streak • {friend.total_workouts} total workouts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏋️‍♂️</div>
            <p className="text-gray-600">No recent workouts</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 mb-3">Recent Workouts</h3>
            {workouts.map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedWorkout(
                    expandedWorkout === workout.id ? null : workout.id
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {workout.body_part.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getMoodEmoji(workout.mood)}</span>
                      {workout.intensity && (
                        <span className="text-sm text-gray-500">
                          {workout.intensity}/5
                        </span>
                      )}
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedWorkout === workout.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedWorkout === workout.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    {workout.notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{workout.notes}</p>
                      </div>
                    )}
                    {workout.struggles && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Struggles:</p>
                        <p className="text-sm text-gray-600">{workout.struggles}</p>
                      </div>
                    )}
                    {!workout.notes && !workout.struggles && (
                      <p className="text-sm text-gray-500 mt-3 italic">No additional details</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
