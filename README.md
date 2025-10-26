# 🧠 AI Note-Taker 2.0

> **Transform your notes with AI-powered summaries that stream in real-time**

A modern, production-ready note-taking application with streaming AI summaries, automatic tagging, and semantic search. Watch as AI generates summaries character-by-character, just like ChatGPT.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai)](https://openai.com/)

---

## ✨ Features

### 🚀 Real-Time AI Streaming
- **Character-by-character summaries** - Watch AI type out summaries in real-time
- **Live status updates** - See exactly what AI is doing
- **Smooth animations** - Pulsing cards, fading tags, blinking cursor
- **No refresh needed** - Updates happen automatically

### 📝 Smart Note Taking
- **Rich text capture** - Create notes with ease
- **File upload support** - .txt, .md, .pdf, .mp3, .m4a
- **Inline title editing** - Click to edit note titles
- **Automatic tagging** - AI generates relevant tags

### 🔍 Powerful Search
- **Keyword search** - Find notes by title, content, or summary
- **Tag filtering** - Filter by AI-generated tags
- **Semantic search** - Vector similarity with pgvector
- **Instant results** - Fast and accurate

### 🎨 Beautiful Design
- **Inter font** - Clean, modern typography
- **Spacious layout** - Generous whitespace and clear hierarchy
- **Smooth transitions** - Polished hover effects and animations
- **Dark/Light themes** - Toggle with persistent preferences
- **Fully responsive** - Works on all devices

### 🔐 Secure & Private
- **Row-level security** - Your data is completely isolated
- **Supabase Auth** - Email/password + OAuth (Google, GitHub)
- **Private file storage** - Encrypted file uploads

---

## 🎬 Demo

### Creating a Note with AI Streaming

1. **Type your note** → Click "Create Note"
2. **Watch the magic** → AI summary streams in real-time ✨
3. **See tags appear** → Smooth fade-in animations 🏷️
4. **Automatic updates** → No refresh needed! 

The AI processes your note and displays the summary character-by-character, just like ChatGPT.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works great!)
- OpenAI API key

### 1️⃣ Clone & Install

```bash
git clone <your-repo-url>
cd ai_note_taker_v2.0
npm install
```

### 2️⃣ Set Up Environment

Create `.env.local` in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3️⃣ Set Up Database

1. Create a new [Supabase](https://supabase.com/) project
2. Go to **SQL Editor**
3. Run the migration: `supabase/migrations/2025-01-init.sql`
4. Go to **Storage** → Create bucket named `notes` (set to **Private**)

### 4️⃣ Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 5️⃣ Create Your First Note

1. Sign up with email or OAuth
2. Create a note with some content
3. Watch the AI summary stream in real-time! ✨

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | TailwindCSS v3.4, DaisyUI v5 |
| **Fonts** | Inter (Google Fonts) |
| **Backend** | Next.js API Routes (Serverless) |
| **Database** | PostgreSQL (Supabase) + pgvector |
| **Auth** | Supabase Auth (Email + OAuth) |
| **AI** | OpenAI GPT-4o-mini, text-embedding-3-small |
| **Streaming** | Server-Sent Events (SSE) |
| **Validation** | Zod |

---

## 📁 Project Structure

```
├── app/
│   ├── (dash)/              # Dashboard with streaming
│   ├── notes/[id]/          # Note detail with inline editing
│   ├── search/              # Search interface
│   ├── login/               # Authentication
│   └── api/                 # API routes
│       └── notes/[id]/stream/  # ✨ Streaming endpoint
├── components/
│   ├── StreamingAISummary.tsx  # ✨ Streaming UI component
│   ├── layout/              # NavBar, ThemeToggle
│   └── notes/               # Note components
├── lib/supabase/            # Supabase clients
├── supabase/migrations/     # Database schema
└── .env.local               # Environment variables
```

---

## 📖 Documentation

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for comprehensive documentation including:

- 📚 **Complete API documentation**
- 🏗️ **Database schema details**
- 🧩 **Component architecture**
- 🔐 **Authentication & security**
- ✨ **AI streaming implementation**
- 🚢 **Deployment guide**
- 🐛 **Troubleshooting**
- 🔧 **OAuth setup**

---

## 🌟 Key Features Explained

### Real-Time AI Streaming

The standout feature - watch AI summaries appear character-by-character:

```typescript
// Automatic streaming on note creation
<StreamingAISummary
  noteId={newNoteId}
  onComplete={(summary, tags) => {
    // Automatically refreshes the note list
  }}
/>
```

**What you see:**
- ⏳ "Generating summary..." status
- ✍️ Text streaming in real-time with blinking cursor
- 🏷️ "Generating tags..." status
- 🎨 Tags fade in one by one
- ✅ "Complete!" confirmation

### Smart Word Count Protection

- Notes **≤ 5000 words**: AI processes automatically
- Notes **> 5000 words**: Skip to save costs (configurable)

### No Refresh Needed

Everything updates in real-time:
- Create note → AI streams → List updates automatically
- View note → No summary? → Streaming starts automatically

---

## 🎯 Use Cases

Perfect for:

- 📚 **Students** - Summarize lecture notes automatically
- 💼 **Professionals** - Quick meeting notes with AI summaries
- ✍️ **Writers** - Organize ideas with smart tagging
- 🧠 **Researchers** - Semantic search through research notes
- 🎙️ **Podcasters** - Upload audio for transcription (planned)

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy! 🚀

**That's it!** Vercel handles everything automatically.

See [DOCUMENTATION.md](./DOCUMENTATION.md#deployment) for detailed deployment instructions.

---

## 🔒 Security

- ✅ **Row-Level Security (RLS)** - Users can only access their own data
- ✅ **Secure authentication** - Supabase Auth with email + OAuth
- ✅ **Private file storage** - Encrypted uploads in private buckets
- ✅ **Server-side validation** - Zod schemas validate all inputs
- ✅ **Protected routes** - Middleware guards all sensitive pages

---

## 🐛 Common Issues & Solutions

### "AI summary not appearing"
- Check OpenAI API key in `.env.local`
- Ensure note has at least 10 words
- Check browser console for errors

### "Theme toggle not working"
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
- Clear browser cache and localStorage

### "Unauthorized errors"
- Verify Supabase credentials in `.env.local`
- Check you're logged in (cookies)
- Try logging out and back in

See [DOCUMENTATION.md](./DOCUMENTATION.md#troubleshooting) for complete troubleshooting guide.

---

## 🎨 Customization

### Change AI Model

Edit `app/api/notes/[id]/stream/route.ts`:

```typescript
// Change from gpt-4o-mini to gpt-4 for better results
model: 'gpt-4',  // or 'gpt-3.5-turbo' for cost savings
```

### Adjust Word Limit

Edit word count threshold in `app/(dash)/page.tsx` and `app/notes/[id]/NoteDetailClient.tsx`:

```typescript
// Change 5000 to your preferred limit
const shouldAutoProcess = wordCount <= 5000
```

### Customize Theme

Themes are defined in `tailwind.config.js`:

```javascript
daisyui: {
  themes: ["black", "cupcake"],  // Add more themes!
}
```

---

## 🔮 Roadmap

### Coming Soon

- [ ] Note content editing (title editing already works!)
- [ ] Note deletion with confirmation
- [ ] Folders/collections for organization
- [ ] Export notes to Markdown/PDF
- [ ] Rich text editor (Tiptap)
- [ ] Voice recording in browser
- [ ] Share notes with others
- [ ] Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📝 License

MIT License - feel free to use this project however you like!

---

## 🙏 Acknowledgments

Built with amazing tools:

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - AI Models
- [DaisyUI](https://daisyui.com/) - Tailwind Component Library
- [Lucide](https://lucide.dev/) - Beautiful Icons

---

## 📞 Support

Need help? Check out:

- 📖 [DOCUMENTATION.md](./DOCUMENTATION.md) - Complete documentation
- 🐛 [GitHub Issues](../../issues) - Report bugs or request features
- 💬 [Supabase Discord](https://discord.supabase.com/) - Community support

---

## ⭐ Show Your Support

If you like this project, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code

---

<div align="center">

**Built with ❤️ using Next.js, Supabase, and OpenAI**

*Transform your notes with the power of AI*

[Get Started](#-quick-start) • [Documentation](./DOCUMENTATION.md) • [Demo](#-demo)

</div>
