# Gym Tracker 💪

A clean, minimalistic gym tracker built with Next.js, TypeScript, Tailwind CSS, and Supabase. Track your workouts, maintain streaks, and stay motivated with friends.

## ✨ Features

- **Personal Workout Streaks** - Track your consistency (lost after 3 days of inactivity)
- **Simple Workout Logging** - Log body parts, mood, and notes with a clean interface
- **Friend Streaks** - Connect with up to 6 friends and motivate each other
- **Visual Timeline** - See your active and rest days at a glance
- **AI Feedback** - Get personalized encouragement and workout recommendations
- **PWA Support** - Install on mobile for quick workout logging
- **Clean Design** - Apple/Notion-inspired minimalistic interface

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Icons**: Lucide React
- **Styling**: Mobile-first responsive design
- **PWA**: Progressive Web App capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Setup

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Configure Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Mobile Installation (PWA)

1. Visit the site on your mobile device
2. Tap the "Add to Home Screen" prompt
3. Enjoy native-like experience!

## 🎨 Design Principles

- **Light & Minimalistic** - Clean Apple/Notion-inspired design
- **Maximum Spacing** - No clutter, focus on clarity
- **Mobile-First** - Optimized for phone usage
- **Readable Stats** - All information at a glance
- **Friendly & Clear** - Encouraging user experience

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── AuthProvider.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase.ts
public/
├── manifest.json
└── icons/
```

## 🚀 Deployment

Deploy on Vercel (recommended):

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

## 📝 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🤝 Contributing

This is a minimal, focused gym tracker. When contributing:

- Keep the design clean and minimal
- Follow mobile-first approach
- Maintain TypeScript standards
- Test on mobile devices

## 📄 License

MIT License - feel free to use this project for your own gym tracking needs!

---

**Built with ❤️ for a cleaner, more focused fitness tracking experience.**
