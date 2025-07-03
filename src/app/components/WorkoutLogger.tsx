'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface WorkoutLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutLogged: () => void;
}

export default function WorkoutLogger({ isOpen, onClose, onWorkoutLogged }: WorkoutLoggerProps) {
  const [bodyPart, setBodyPart] = useState('');
  const [mood, setMood] = useState(3);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [struggles, setStruggles] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const bodyParts = [
    'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyPart) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          body_part: bodyPart,
          mood,
          intensity,
          notes: notes || null,
          struggles: struggles || null,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Reset form
      setBodyPart('');
      setMood(3);
      setIntensity(3);
      setNotes('');
      setStruggles('');
      
      onWorkoutLogged();
      onClose();
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Log Workout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Body Part */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Part *
            </label>
            <select
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select body part</option>
              {bodyParts.map(part => (
                <option key={part} value={part}>
                  {part.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did you feel? *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(value)}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    mood === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {value === 1 ? '😤' : value === 2 ? '😕' : value === 3 ? '😐' : value === 4 ? '😊' : '😄'}
                  </div>
                  <div className="text-xs">{value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIntensity(value)}
                  className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                    intensity === value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your workout? Any highlights?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Struggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Struggles (optional)
            </label>
            <textarea
              value={struggles}
              onChange={(e) => setStruggles(e.target.value)}
              placeholder="Any challenges or areas to improve?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !bodyPart}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging...' : 'Log Workout'}
          </button>
        </form>
      </div>
    </div>
  );
}
