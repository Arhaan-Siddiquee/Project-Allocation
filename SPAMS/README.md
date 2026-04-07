# 🎓 ProjectHub — Student Project Allocation System

A full-stack project allocation platform for students and faculty built with **React + Vite + TailwindCSS + Supabase**.

---

## ✨ Features

### Student Portal
- Browse & search open projects (by keyword, domain, skills)
- Apply to projects with a cover letter
- View allocated project & progress bar
- Track milestones set by faculty
- Full resume-style profile (skills, strongholds, bio, GitHub, LinkedIn)

### Faculty Portal
- Create & manage projects with required skills, domain, timeline
- Review student applications (accept / reject)
- Allocate students to projects
- Update project progress (slider)
- Set and track milestones
- Search student directory by skill/name
- View full student profile modal
- Profile with project history

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Auth + Database**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v6
- **Icons**: Lucide React

---

## 🚀 Setup Guide

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `project-hub` (or anything)
   - **Database Password**: save this somewhere safe
   - **Region**: pick closest to you
4. Wait ~2 minutes for the project to spin up

---

### Step 2 — Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from this project
4. Paste the entire contents into the editor
5. Click **"Run"** (▶)
6. You should see "Success" for all statements

This creates:
- `student_profiles` table
- `faculty_profiles` table
- `projects` table
- `applications` table
- `milestones` table
- All Row Level Security (RLS) policies
- Auto-updated `updated_at` triggers

---

### Step 3 — Configure Supabase Auth

1. In Supabase dashboard → **Authentication** → **Providers**
2. Make sure **Email** provider is enabled (it is by default)
3. Optional: Go to **Authentication** → **Settings** → disable "Confirm email" for easier dev testing

---

### Step 4 — Get Your API Keys

1. In Supabase dashboard → **Project Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** → `https://xxxxxxxxxxxx.supabase.co`
   - **anon public** key → `eyJhbGci...` (long string)

---

### Step 5 — Configure Environment Variables

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your values:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Step 6 — Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
project-allocator/
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   └── Sidebar.jsx          # Shared sidebar nav
│   │   ├── student/
│   │   │   └── StudentLayout.jsx    # Student page wrapper
│   │   └── faculty/
│   │       └── FacultyLayout.jsx    # Faculty page wrapper
│   ├── hooks/
│   │   └── useAuth.jsx              # Auth context + provider
│   ├── lib/
│   │   └── supabase.js              # Supabase client + helpers
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── student/
│   │   │   ├── Dashboard.jsx        # Overview + stats
│   │   │   ├── Profile.jsx          # Resume builder
│   │   │   ├── Projects.jsx         # Browse + apply
│   │   │   └── MyProject.jsx        # Allocated project + progress
│   │   └── faculty/
│   │       ├── Dashboard.jsx        # Overview + recent activity
│   │       ├── Profile.jsx          # Faculty profile + history
│   │       ├── Projects.jsx         # Create + list projects
│   │       ├── ProjectDetail.jsx    # Applications, milestones, team
│   │       └── Students.jsx         # Student directory
│   ├── App.jsx                      # Routes + auth guards
│   ├── main.jsx
│   └── index.css                    # Tailwind + global styles
├── supabase-schema.sql              # Full DB schema — run in Supabase
├── .env.example                     # Copy to .env and fill values
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🎨 Design System

- **Font**: Syne (display) + DM Sans (body) + JetBrains Mono (code)
- **Color palette**: Deep void dark (#050508) with indigo accent (#6366f1)
- **Style**: Web3/Next.js inspired — grid pattern, glow orbs, glassmorphism cards
- **Theme**: Dark-only, consistent CSS variables throughout

---

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

> **Remember**: Set your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform too.
