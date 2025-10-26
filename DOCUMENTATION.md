# 🧠 AI Note-Taker 2.0 - Complete Documentation

**A production-ready AI-powered note-taking application with streaming AI summaries**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Quick Start](#quick-start)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Component Architecture](#component-architecture)
9. [Authentication & Security](#authentication--security)
10. [AI Features & Streaming](#ai-features--streaming)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Fixes Applied](#fixes-applied)
14. [OAuth Setup](#oauth-setup)

---

## 🎯 Project Overview

AI Note-Taker 2.0 is a modern, full-stack application for capturing, organizing, and searching notes with AI-powered features including:

- **Smart Capture**: Text notes with file upload support (.txt, .md, .pdf, .mp3, .m4a)
- **Real-Time AI Processing**: Streaming summaries that type out character-by-character
- **Automatic Tagging**: AI-generated tags for organization
- **Hybrid Search**: Combines keyword and semantic vector search
- **Secure**: Row-level security (RLS) ensures complete user data isolation
- **Beautiful UI**: DaisyUI components with Inter font and modern design

### Key Capabilities

- 📝 Create and organize notes with rich text
- 🤖 Watch AI summaries stream in real-time (ChatGPT-style)
- 🏷️ Automatic tag generation with fade-in animations
- 🔍 Powerful search with keyword + vector similarity
- 🔐 Secure authentication with Supabase Auth
- 🎨 Modern UI with clean, spacious design
- 📱 Fully responsive design
- ✨ No refresh needed - updates happen automatically

---

## ✨ Features

### Core Features

- **Rich Note Capture** - Text notes with file upload (.txt, .md, .pdf, .mp3, .m4a)
- **Streaming AI Summaries** - Watch AI generate summaries in real-time with typing effect
- **Automatic Tagging** - AI-generated tags appear with smooth animations
- **Title Editing** - Click to edit note titles inline
- **Hybrid Search** - Keyword + semantic vector search
- **Beautiful UI** - Inter font, spacious layout, smooth transitions
- **Secure** - Row-level security (RLS) with complete user data isolation
- **Responsive** - Works perfectly on all devices

### AI Features

- ✅ **Real-time streaming summaries** - Character-by-character display
- ✅ **Automatic processing** - No manual triggers needed
- ✅ **Smart word count limits** - Only processes notes ≤ 5000 words
- ✅ **Live status updates** - See exactly what AI is doing
- ✅ **Smooth animations** - Pulsing cards, fading tags
- ✅ **Error handling** - Clear error messages if something fails

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, TypeScript, React Server Components)
- **Styling**: TailwindCSS v3.4 + DaisyUI v5
- **Fonts**: Inter (Google Fonts)
- **UI Pattern**: Server Components for data, Client Components for interactivity

### Backend
- **API**: Next.js API Routes (serverless)
- **Authentication**: Supabase Auth (email/password + OAuth: Google, GitHub)
- **Database**: PostgreSQL via Supabase
- **Vector Search**: pgvector extension for semantic search
- **Storage**: Supabase Storage (private buckets)

### AI/ML
- **Embeddings**: OpenAI `text-embedding-3-small` (1536 dimensions)
- **Summarization**: GPT-4o-mini (streaming enabled)
- **Tag Generation**: GPT-4o-mini
- **Streaming**: Server-Sent Events (SSE)

### Validation & Type Safety
- **Schema Validation**: Zod
- **Type Safety**: TypeScript throughout

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (for AI features)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration: `supabase/migrations/2025-01-init.sql`
4. Create a storage bucket named `notes` (set to **Private**)

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Create an Account

- Go to `/login`
- Sign up with email or OAuth (Google/GitHub)
- Start creating notes!
- Watch AI summaries stream in real-time!

---

## 📁 Project Structure

```
ai_note_taker_v2.0/
├── app/                              # Next.js App Router
│   ├── (dash)/                       # Dashboard (protected route)
│   │   └── page.tsx                  # Main dashboard with streaming
│   ├── notes/[id]/                   # Note detail pages
│   │   ├── page.tsx                  # Note viewer (server component)
│   │   └── NoteDetailClient.tsx     # Client component with streaming
│   ├── search/                       # Search interface
│   │   └── page.tsx
│   ├── login/                        # Authentication pages
│   │   └── page.tsx
│   ├── auth/callback/                # OAuth callback handler
│   │   └── route.ts
│   ├── api/                          # API Routes
│   │   ├── notes/
│   │   │   ├── route.ts              # POST /api/notes (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts          # PATCH /api/notes/:id (update)
│   │   │       ├── process/          # POST (non-streaming AI)
│   │   │       │   └── route.ts
│   │   │       └── stream/           # GET (streaming AI) ✨
│   │   │           └── route.ts
│   │   └── search/
│   │       └── route.ts              # POST /api/search
│   ├── layout.tsx                    # Root layout with Inter font
│   ├── theme-provider.tsx            # Client-side theme loader
│   └── globals.css                   # Tailwind + DaisyUI + animations
│
├── components/                       # React Components
│   ├── layout/
│   │   ├── NavBar.tsx                # Navigation with logout
│   │   └── ThemeToggle.tsx           # Theme switcher
│   ├── notes/
│   │   ├── NoteComposer.tsx          # Note creation form
│   │   ├── NoteCard.tsx              # Note preview with AI indicators
│   │   └── NoteList.tsx              # Grid of notes
│   ├── SearchBar.tsx                 # Search input with ⌘K hint
│   ├── TagPills.tsx                  # Filterable tag badges
│   ├── EmptyState.tsx                # Empty states
│   └── StreamingAISummary.tsx        # Streaming UI component ✨
│
├── lib/
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       └── server.ts                 # Server Supabase client
│
├── supabase/
│   └── migrations/
│       └── 2025-01-init.sql          # Complete database schema
│
├── proxy.ts                          # Next.js 16 auth proxy
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.mjs                # PostCSS with Tailwind v4
├── .env.local                        # Environment variables (create this)
└── package.json                      # Dependencies
```

---

## 🗄 Database Schema

### Tables

#### `profiles`
User profile data (minimal).
```sql
- user_id (uuid, PK)
- name (text)
- created_at (timestamptz)
```

#### `notes`
Core notes table with AI-generated metadata.
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- title (text, nullable)
- content (text, nullable)
- file_url (text, nullable)
- source_type (text: 'text'|'audio'|'pdf'|'web')
- tokens (int, default 0)
- summary (text, nullable) ← AI-generated via streaming
- tags (text[], default []) ← AI-generated
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### `note_chunks`
Text chunks with vector embeddings for semantic search.
```sql
- id (uuid, PK)
- note_id (uuid, FK → notes)
- chunk_index (int)
- content (text)
- embedding (vector(1536)) ← OpenAI embeddings
```

#### `note_events`
Audit log for note operations.
```sql
- id (bigserial, PK)
- note_id (uuid, FK → notes)
- user_id (uuid)
- event_type (text: 'created'|'embedded'|'summarized'|'error')
- details (jsonb)
- created_at (timestamptz)
```

### Indexes

- **B-tree**: `user_id`, `created_at`, `note_id`
- **GIN**: `tags` (array operations), trigram indexes on `title`, `content`, `summary`
- **IVFFLAT** (vector): `note_chunks.embedding` with `vector_cosine_ops`

### Row-Level Security (RLS)

All tables have RLS enabled. Users can ONLY access their own data via `auth.uid()` policies.

**Example (notes table):**
```sql
-- Users can only select their own notes
CREATE POLICY "select own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());
```

---

## 🔌 API Documentation

### Authentication

All API routes require authentication via Supabase session cookies. Unauthenticated requests return `401 Unauthorized`.

### Endpoints

#### `POST /api/notes`

Create a new note. AI processing starts automatically via client-side streaming.

**Request (multipart/form-data):**
```typescript
{
  title?: string;
  content?: string;
  file?: File;
  source_type: 'text' | 'audio' | 'pdf' | 'web';
}
```

**Response (201):**
```json
{
  "note": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My Note",
    "content": "Note content...",
    "created_at": "2025-01-26T..."
  }
}
```

**Errors:**
- `400`: Invalid input (Zod validation failed)
- `401`: Unauthorized
- `500`: Server error

---

#### `GET /api/notes/:id/stream` ✨

Stream AI processing in real-time. Returns Server-Sent Events.

**Response (SSE Stream):**
```
data: {"type":"status","message":"Generating summary..."}
data: {"type":"summary","content":"This"}
data: {"type":"summary","content":" is"}
data: {"type":"summary","content":" a"}
data: {"type":"summary","content":" summary"}
data: {"type":"status","message":"Generating tags..."}
data: {"type":"tags","tags":["ai","notes","productivity"]}
data: {"type":"status","message":"Creating embeddings..."}
data: {"type":"complete","summary":"This is a summary","tags":[...]}
```

**Event Types:**
- `status`: Progress updates
- `summary`: Incremental summary text (streams character-by-character)
- `tags`: Generated tags array
- `complete`: Final result with full summary and tags
- `error`: Error message

**Errors:**
- `400`: Insufficient content or word count > 5000
- `404`: Note not found
- `401`: Unauthorized

---

#### `PATCH /api/notes/:id`

Update a note (currently supports title editing).

**Request:**
```json
{
  "title": "Updated Title"
}
```

**Response (200):**
```json
{
  "success": true,
  "note": { "id": "uuid", "title": "Updated Title", ... }
}
```

---

#### `POST /api/search`

Search notes using keyword matching and semantic vector search.

**Request:**
```json
{
  "query": "search term",
  "tags": ["tag1", "tag2"]  // optional
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Matching Note",
      "summary": "...",
      "tags": ["tag1"],
      "created_at": "2025-01-26T..."
    }
  ],
  "count": 1
}
```

---

## 🧩 Component Architecture

### Design Principles

1. **Server Components First**: Data fetching happens in Server Components
2. **Client Components for Interactivity**: `'use client'` only when needed
3. **Streaming for Real-Time Updates**: SSE for AI processing
4. **Presentational Components**: Pure components receive data as props

### Key Components

#### `StreamingAISummary` ✨ (Client Component)
The star of the show - displays AI summaries streaming in real-time.

**Features:**
- Character-by-character typing effect
- Blinking cursor while streaming
- Pulsing card animation
- Live status updates
- Smooth tag fade-ins
- Error handling

**Usage:**
```tsx
<StreamingAISummary
  noteId={noteId}
  onComplete={(summary, tags) => {
    // Handle completion
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

#### `NoteDetailClient` (Client Component)
Handles interactive note viewing with:
- Title editing (inline)
- Auto-start streaming for notes without summaries
- Updates in real-time

#### `NoteCard` (Presentational)
- Displays note preview
- Shows AI indicators (✨ badge)
- Hover effects
- Click to view details

#### `NavBar` (Client Component)
- Navigation and branding
- User menu with logout
- Theme toggle

---

## 🔐 Authentication & Security

### Supabase Auth

Uses Supabase's built-in authentication system:

- **Email/Password**: Standard auth with email confirmation
- **OAuth**: Google and GitHub providers (requires setup)
- **Session Management**: HTTP-only cookies managed by Supabase

### Route Protection

`proxy.ts` (Next.js 16 proxy file) protects routes:

```typescript
const protectedPaths = ['/', '/notes', '/search', '/api/notes', '/api/search'];

if (isProtectedPath && !user) {
  return NextResponse.redirect('/login?redirect=...');
}
```

### Row-Level Security (RLS)

**Every table has RLS enabled.** Users can only access their own data:

```sql
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());
```

### Storage Security

- Files stored in **private** `notes` bucket
- Only authenticated users can upload to their own folder: `{user_id}/filename`
- RLS policies on `storage.objects` table enforce access control

---

## ✨ AI Features & Streaming

### How Streaming Works

```
Client                    Server
  │                         │
  ├─> GET /stream ─────────>│
  │                         │
  │   <── SSE: status ──────┤ "Generating summary..."
  │   <── SSE: summary ─────┤ "This"
  │   <── SSE: summary ─────┤ " is"
  │   <── SSE: summary ─────┤ " awesome"
  │   <── SSE: tags ────────┤ ["ai", "notes"]
  │   <── SSE: complete ────┤
  │                         │
  └─> Update UI in real-time
```

### User Experience

1. **Create Note**: Type content and click "Create"
2. **Streaming Starts**: See a pulsing card appear
3. **Watch Summary**: Text appears character-by-character
4. **See Status**: "Generating tags..." appears
5. **Tags Fade In**: Tags appear one by one with animation
6. **Completion**: Card stops pulsing, "Complete!" message
7. **Auto-Refresh**: Note list updates automatically

### Visual Features

- **Blinking cursor** (█) while streaming
- **Pulsing border** during processing
- **GPT-4 badge** showing model
- **Spinner animation** for status
- **Smooth fade-in** for tags
- **Color-coded states**: Primary (processing), Success (complete), Error (failed)

### Word Count Protection

- Notes > 5000 words won't auto-process (cost savings)
- Clear messaging for large notes
- Manual processing can still be triggered if needed

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   OPENAI_API_KEY=...
   ```

4. **Deploy**
   - Vercel auto-deploys on push to `main`
   - Preview deployments for PRs

### Post-Deployment

- Update Supabase Auth settings with production URL
- Configure OAuth redirect URIs for production domain
- Test authentication flows and streaming

---

## 🐛 Troubleshooting

### Streaming Issues

#### Summary Not Appearing / Blank Screen

**Problem:** Streaming starts but no text appears

**Solutions:**
1. Check browser console for errors
2. Verify OpenAI API key is correct in `.env.local`
3. Check network tab - should see `/stream` request with status 200
4. Verify note has content (at least 10 words)

---

#### "Response body is null" Error

**Problem:** Streaming fails to start

**Solution:**
- This is handled in code, but if you see it, check:
  1. Server is running properly
  2. API route file exists at `app/api/notes/[id]/stream/route.ts`
  3. Restart dev server

---

### Theme Issues

#### Theme Toggle Not Working

**Problem:** Clicking sun/moon button doesn't change theme

**Solutions:**
1. Check browser console for errors
2. Verify `localStorage` permissions (not blocked)
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Check `app/theme-provider.tsx` is imported in `layout.tsx`
5. Clear browser cache and localStorage

---

### Authentication Issues

#### "Unauthorized" Errors

**Problem:** Can't access protected pages or API routes

**Solutions:**
1. Check `.env.local` has correct Supabase credentials
2. Verify user is logged in (check browser devtools → Application → Cookies)
3. Check RLS policies: `SELECT * FROM pg_policies;`
4. Try logging out and back in

---

#### OAuth Not Working

**Problem:** Google/GitHub login fails

**Solutions:**
1. OAuth requires setup in Supabase dashboard (see [OAuth Setup](#oauth-setup))
2. For development, just use email/password authentication
3. Check redirect URIs match in OAuth provider settings

---

### Build Issues

#### TypeScript Errors

**Problem:** Build fails with TypeScript errors

**Solutions:**
1. Run `npm run build` to see all errors
2. Check imports are correct
3. Verify all required props are passed
4. Use TypeScript strict mode

---

#### Tailwind CSS Not Loading

**Problem:** Styles not appearing

**Solutions:**
1. Check `postcss.config.mjs` uses `@tailwindcss/postcss`
2. Verify `app/globals.css` has:
   ```css
   @import "tailwindcss";
   @plugin "daisyui";
   ```
3. Restart dev server completely
4. Clear `.next` folder: `rm -rf .next` then `npm run dev`

---

## 📋 Fixes Applied

### Major Fixes

#### 1. Streaming AI Implementation ✨
**What was added:**
- Real-time streaming summaries with character-by-character display
- Server-Sent Events (SSE) endpoint
- StreamingAISummary component with animations
- Auto-start streaming on note creation and viewing
- No refresh needed - automatic updates

**Files:**
- `app/api/notes/[id]/stream/route.ts` (new)
- `components/StreamingAISummary.tsx` (new)
- `app/(dash)/page.tsx` (updated)
- `app/notes/[id]/NoteDetailClient.tsx` (updated)

---

#### 2. Title Editing
**What was added:**
- Inline title editing on note detail page
- Save/cancel functionality
- API endpoint for PATCH updates

**Files:**
- `app/api/notes/[id]/route.ts` (new)
- `app/notes/[id]/NoteDetailClient.tsx` (updated)

---

#### 3. Logout Button Fixed
**Problem:** Logout button was non-functional

**Solution:**
- Added `handleLogout` function calling `supabase.auth.signOut()`
- Changed to proper button with onClick handler
- Added router navigation to `/login`

**File:** `components/layout/NavBar.tsx`

---

#### 4. Theme Toggle Fixed
**Problem:** DaisyUI wasn't loading, themes weren't working

**Solution:**
- Fixed Tailwind CSS v4 + DaisyUI configuration
- Created ThemeProvider for localStorage persistence
- Themes now properly switch and persist

**Files:**
- `app/globals.css`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `app/theme-provider.tsx`

---

#### 5. Font Upgrade
**What changed:**
- Switched entire app to Inter font (Google Fonts)
- Applied to all components via CSS variables
- Clean, modern, slightly casual appearance

**Files:**
- `app/layout.tsx`
- `tailwind.config.js`
- `app/globals.css`

---

#### 6. UI Improvements
**What changed:**
- Increased spacing throughout (py-8, gap-6, mb-10)
- Larger typography (4xl titles, 3xl headings)
- Better shadows (shadow-xl, hover:shadow-2xl)
- Smooth transitions and hover effects
- Centered login heading

**Files:**
- `app/login/page.tsx`
- `app/(dash)/page.tsx`
- `app/search/page.tsx`
- `components/notes/NoteCard.tsx`
- `components/EmptyState.tsx`

---

## 🔐 OAuth Setup

### ⚠️ Important Note

**For development, you can skip OAuth and just use email/password authentication.** OAuth is optional and not required for the app to work.

### How to Enable OAuth (Optional)

#### Enable Google OAuth

**Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

**Step 2: Configure in Supabase**

1. Go to your Supabase project
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

---

#### Enable GitHub OAuth

**Step 1: Create GitHub OAuth App**

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: AI Note-Taker
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: 
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy **Client ID**
6. Generate a **Client Secret** and copy it

**Step 2: Configure in Supabase**

1. Go to your Supabase project
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and click to expand
4. Toggle **Enable Sign in with GitHub**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

---

### Testing OAuth

After configuration:

1. Restart your dev server: `npm run dev`
2. Go to `/login`
3. Click **Continue with Google** or **Continue with GitHub**
4. Should redirect to OAuth provider
5. After authorization, redirects back to your app
6. User is logged in!

---

## 📊 Performance Considerations

### Database Queries

- Use indexes effectively (created in migration)
- Limit result sets (`.limit(10)` on dashboard)
- Use `select('*')` sparingly

### Vector Search Optimization

When enabling vector search:
```sql
SET ivfflat.probes = 10;  -- Higher = better recall, slower
REINDEX INDEX note_chunks_embedding_ivfflat;
```

### Frontend Optimization

- Server Components reduce client JS bundle
- Streaming provides instant feedback
- Lazy load when needed

---

## 🔮 Future Enhancements

### Potential Improvements

- [ ] **Note Editing**: Edit note content, not just title
- [ ] **Note Deletion**: Soft or hard delete with confirmation
- [ ] **Folders/Collections**: Organize notes into categories
- [ ] **Sharing**: Share notes with other users
- [ ] **Export**: Download notes as Markdown or PDF
- [ ] **Rich Text Editor**: Replace textarea with Tiptap
- [ ] **Voice Recording**: Record audio directly in browser
- [ ] **Background Jobs**: Queue for large-scale processing
- [ ] **Analytics Dashboard**: Usage stats and insights

---

## 📝 Developer Notes

### Code Conventions

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Absolute imports with `@/` alias
- **Styling**: DaisyUI tokens + custom animations

### Git Workflow

- `main` branch for production
- Feature branches for new work
- Meaningful commit messages

---

## 📞 Support & Resources

### Documentation Links

- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **DaisyUI**: https://daisyui.com
- **OpenAI API**: https://platform.openai.com/docs

### Tips

1. Check this documentation first
2. Review browser console for errors
3. Use TypeScript errors to guide fixes
4. Test in incognito mode for auth issues

---

## 📜 License

MIT License - See project files for details.

---

**Built with ❤️ using Next.js, Supabase, and OpenAI**

*Last updated: January 2025*

