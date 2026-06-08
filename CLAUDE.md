@AGENTS.md

# NEXO UAPA — Project Context for AI Assistants

## What this project is
NEXO UAPA is a community, productivity and academic interaction platform for students of Universidad Abierta para Adultos (UAPA). It mirrors the layout of X/Twitter (3-column) but is academic-focused.

## Tech Stack (actual — differs from original plan)
- **Framework**: Next.js 16.2.7 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + CSS variables for theming
- **Icons**: Lucide React (NO emojis in UI code, ever)
- **DB**: Turso (libsql cloud) via Prisma v7 + `@prisma/adapter-libsql`
- **Image storage**: Vercel Blob (`@vercel/blob`) — token: `BLOB_READ_WRITE_TOKEN`
- **Auth**: NextAuth.js v5 (credentials provider, JWT)
- **State**: Zustand for client state (theme/lang)

## Critical architecture notes
- **Prisma v7**: datasource URL goes in `prisma.config.ts`, NOT in `schema.prisma`
- **Turso in production**: must use `https://` URL (not `libsql://`) to avoid "fetch failed" in Vercel serverless
- **New migrations**: run `npx prisma migrate dev` locally → apply SQL to Turso: `~/.turso/turso db shell nexo-uapa < migration.sql`
- **NextAuth v5**: route handler `params` is `Promise<{...}>` — always `await params`
- **next.config.ts**: `serverExternalPackages` required for `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`

## Production infrastructure
- **Hosting**: Vercel → https://nexouapa.vercel.app
- **Database**: Turso → `https://nexo-uapa-leilanym.aws-us-east-2.turso.io`
- **Image storage**: Vercel Blob store `nexouapa-images2`
- **GitHub**: https://github.com/leilameca/nexouapa

## Institutional email validation
- Students: `@p.uapa.edu.do`
- Staff/professors: `@uapa.edu.do`
- Both are accepted in register

## Folder structure
```
src/
  app/
    (auth)/login              # Login page
    (auth)/register           # Register page
    (main)/feed               # Feed — 3 post types, interactions, images
    (main)/vitrina            # Projects showcase with filters
    (main)/pomodoro           # Study rooms with 25/5 timer
    (main)/apuntes            # Personal notes (CRUD, public/private)
    (main)/rankings           # Reputation leaderboard
    (main)/settings           # Profile, avatar upload, theme, language
    (main)/perfil/[id]        # Public user profile page
    api/posts                 # GET (feed, filter by type/userId) + POST
    api/posts/[id]            # DELETE (own posts only)
    api/posts/[id]/comments   # GET + POST comments
    api/posts/[id]/interact   # POST like/upvote/repost
    api/notes                 # GET + POST notes (own user)
    api/notes/[id]            # PUT + DELETE notes (own user)
    api/rooms                 # GET rooms + POST create room
    api/rankings              # GET leaderboard (top 20 by reputationPoints)
    api/upload                # POST upload image to Vercel Blob
    api/user/profile          # GET + PUT own profile (incl. avatarUrl)
    api/user/[id]             # GET public profile
    api/auth/register         # POST register new user
  components/
    feed/PostCard             # Post card with comments, interactions, delete
    feed/PostComposer         # Composer with image upload (all post types)
    layout/Sidebar            # Left sidebar (hidden on mobile, icons on md, full on xl)
    layout/MobileNav          # Bottom nav bar (6 items including Settings)
    layout/RightPanel         # Right panel: live Pomodoro rooms + top 3 ranking
    pomodoro/PomodoroTimer    # SVG circular timer
  lib/
    db.ts                     # Prisma client singleton (libsql adapter)
    auth.ts                   # NextAuth config
    i18n.ts                   # Translation helper
    uapa-data.ts              # UAPA schools and careers data
  stores/
    appStore.ts               # Zustand: theme + lang (reads from cookie on init)
  types/
    index.ts                  # Post, User, Comment, PomodoroRoom, LeaderboardEntry
  i18n/
    es.json                   # Spanish translations
    en.json                   # English translations
prisma/
  schema.prisma               # Models: User, Post, Interaction, Comment, PomodoroRoom, RoomParticipant, Note
  prisma.config.ts            # Prisma v7 config (datasource URL lives here)
  migrations/                 # SQL migration history
```

## Database entities
See `prisma/schema.prisma`. Tables:
- **User** — auth, profile, reputation, avatar, bio, github, linkedin
- **Post** — general/question/project, thumbnailUrl (images), subjectTag, projectUrl
- **Interaction** — like/upvote/repost (unique per user+post+type)
- **Comment** — with parent/reply threading, isUseful flag
- **PomodoroRoom** — name, school, isBreak, cycleStart, timerSeconds
- **RoomParticipant** — userId + roomId join
- **Note** — userId, title, content, subject, isPublic, updatedAt

## Key design rules
1. **Zero emojis** in hardcoded UI — use Lucide icons only.
2. **WCAG AA** contrast in dark mode.
3. **No FOUC** — theme/language loaded from cookie before first paint.
4. Institutional email validation on register.
5. Only the post/note owner can delete their own content.

## UAPA Brand colors
- Primary: `#003C82` (UAPA institutional blue)
- Accent: `#F5A623` (orange)
- Background light: `#F7F9FC`
- Background dark: `#0D1117`
- Text primary light: `#0D1117`
- Text primary dark: `#E6EDF3`

## Current build status
- [x] Tailwind theme tokens + CSS variables
- [x] Prisma schema (all 7 models)
- [x] NextAuth (credentials, JWT, email validation)
- [x] 3-column layout (responsive: mobile / tablet / desktop)
- [x] Feed module (3 types, images, likes/upvotes/reposts/comments, delete, pagination)
- [x] Vitrina module (project posts, school filter, sort recent/popular)
- [x] Pomodoro module (rooms in DB, 25/5 timer, break-only chat)
- [x] Rankings module (real reputation points, top 3 + list, profile links)
- [x] Apuntes module (full CRUD in DB, public/private toggle, live search)
- [x] User profiles /perfil/[id] (posts, bio, reputation, social links)
- [x] Avatar/photo upload (Vercel Blob)
- [x] i18n ES + EN
- [x] Dark mode persistence (cookie)
- [x] Right panel with real data (live countdowns, real top 3)
- [x] Mobile navigation (bottom nav with all 6 sections)
- [ ] Pomodoro real-time sync between users (WebSocket / SSE)
- [ ] Notifications (likes, comments on your posts)
- [ ] Global search (posts + users)
- [ ] Public notes feed (community notes)
