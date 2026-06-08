@AGENTS.md

# NEXO UAPA — Project Context for AI Assistants

## What this project is
NEXO UAPA is a community, productivity and academic interaction platform for students of Universidad Abierta para Adultos (UAPA). It mirrors the layout of X/Twitter (3-column) but is academic-focused: feed, showcase, study groups, direct messaging, quiz rooms, notes, rankings and notifications.

## Tech Stack
- **Framework**: Next.js 16.2.7 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + CSS variables for theming (`globals.css`)
- **Icons**: Lucide React — **NO emojis in UI code, ever**
- **DB**: Turso (libsql cloud) via Prisma v7 + `@prisma/adapter-libsql`
- **Image storage**: Vercel Blob (`@vercel/blob`) — token: `BLOB_READ_WRITE_TOKEN`
- **Auth**: NextAuth.js v5 (credentials provider, JWT)
- **State**: Zustand — theme + language (persisted in cookies)

## Critical architecture notes
- **Prisma v7**: datasource URL lives in `prisma.config.ts`, NOT in `schema.prisma`
- **Turso in production**: use `https://` URL (not `libsql://`) — avoids "fetch failed" in Vercel serverless
- **New migrations**: run `npx prisma migrate dev --name <name>` locally, then apply to Turso via `/api/setup-db?secret=nexouapa2024` (see below)
- **NextAuth v5**: route handler `params` is `Promise<{...}>` — always `await params`
- **next.config.ts**: `serverExternalPackages` required for `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`
- **Skeleton variable**: `--skeleton` CSS var defined in `:root` and `[data-theme="dark"]` for `<Skeleton>` component

## Production infrastructure
- **Hosting**: Vercel → https://nexouapa.vercel.app
- **Database**: Turso → `https://nexo-uapa-leilanym.aws-us-east-2.turso.io`
- **Image storage**: Vercel Blob store `nexouapa-images2`
- **GitHub**: https://github.com/leilameca/nexouapa

## Applying DB migrations to Turso (production)
When new Prisma migrations are added, apply them to Turso by calling:
```
GET https://nexouapa.vercel.app/api/setup-db?secret=nexouapa2024
```
This endpoint runs all `CREATE TABLE IF NOT EXISTS` statements idempotently.
Source: `src/app/api/setup-db/route.ts`

## Institutional email validation
- Students: `@p.uapa.edu.do`
- Staff/professors: `@uapa.edu.do`
- Both accepted at register — validated in `api/auth/register`

## UAPA Brand colors
- Primary: `#002D72` (UAPA institutional blue — darker than the original #003C82)
- Accent: `#F5A623` (orange)
- Background light: `#F7F9FC`
- Background dark: `#0D1117`
- Text primary light: `#0D1117`
- Text primary dark: `#E6EDF3`

---

## Folder structure

```
src/
  app/
    (auth)/
      login/                   # Login page (credentials)
      register/                # Register page (institutional email validation)

    (main)/                    # Protected layout — redirects to /login if no session
      feed/                    # Global feed (3 post types, images, interactions)
      vitrina/                 # Project showcase (filter by school, sort recent/popular)
      apuntes/                 # Personal notes — CRUD, public/private, live search, skeleton loaders
      rankings/                # Reputation leaderboard (top 20, medal top 3)
      settings/                # Profile editor, avatar upload, theme, language
      perfil/[id]/             # Public profile: posts, bio, follow/unfollow, message button
      notificaciones/          # In-app notifications feed (marks as read on open)
      quiz/                    # Quiz rooms list (replaces Pomodoro as main study feature)
      quiz/[id]/               # Quiz room detail: questions, answers, per-room leaderboard
      mensajes/                # Direct messages conversation list
      mensajes/[id]/           # Chat window (3s polling, bubbles, Leído/Enviado, block user)
      grupos/                  # Study groups list (join/leave, create, search)
      grupos/[id]/             # Group detail: Feed tab / Members tab / Events tab

    api/
      auth/[...nextauth]/      # NextAuth v5 handler
      auth/register/           # POST — create user (bcrypt, email validation)
      posts/                   # GET paginated feed + POST create post
      posts/[id]/              # DELETE own post
      posts/[id]/comments/     # GET threaded comments + POST comment/reply + @mention notifications
      posts/[id]/interact/     # POST like/upvote/repost (toggle) + notification to author
      notes/                   # GET own notes + POST create
      notes/[id]/              # PUT + DELETE own note
      rooms/                   # GET Pomodoro rooms + POST create (legacy)
      rankings/                # GET top 20 by reputationPoints
      upload/                  # POST image to Vercel Blob
      user/profile/            # GET + PUT own profile (avatarUrl, bio, socials)
      user/[id]/               # GET public profile
      users/[id]/follow/       # GET follow stats + POST toggle follow/unfollow
      users/[id]/block/        # GET block status + POST toggle block/unblock
      notifications/           # GET notifications + PATCH mark-all-read
      quiz/                    # GET rooms list + POST create room
      quiz/[id]/               # GET room detail + PATCH activate + DELETE
      quiz/[id]/join/          # POST join room
      quiz/[id]/questions/     # POST add question (host only)
      quiz/[id]/answer/        # POST submit answer (scores +10 pts, +5 reputation)
      conversations/           # GET conversation list + POST open/get DM
      conversations/[id]/messages/  # GET messages (marks read) + POST send message
      groups/                  # GET all groups + POST create group
      groups/[id]/             # GET group detail + DELETE (creator only)
      groups/[id]/join/        # POST join/leave group
      groups/[id]/posts/       # GET group posts + POST (members only, notifies members)
      groups/[id]/events/      # GET upcoming events + POST schedule event
      setup-db/                # GET — applies all pending migrations to Turso (secret required)

  components/
    feed/
      PostCard                 # Post card: threaded comments, reply, @mention highlight, interactions, delete
      PostComposer             # Composer: 3 post types, image upload, subject tag
    layout/
      Sidebar                  # Left sidebar (hidden mobile, icon-only md, full xl) — bell badge
      MobileNav                # Bottom nav (5 items: Home, Groups, Messages, Notifications, Settings)
      RightPanel               # Right panel: quiz rooms + top-3 ranking (hidden mobile/tablet)
    ui/
      Skeleton                 # Skeleton loader components: Skeleton, PostSkeleton, NoteSkeleton, ConversationSkeleton
    Providers                  # SessionProvider wrapper (client)

  lib/
    db.ts                      # Prisma singleton (libsql adapter, env-aware URL)
    auth.ts                    # NextAuth config (credentials, JWT callbacks)
    i18n.ts                    # Translation helper (getDict)
    uapa-data.ts               # UAPA schools + careers static data

  stores/
    appStore.ts                # Zustand: theme + lang (cookie persistence, no FOUC)

  types/
    index.ts                   # Post, User, Comment, PomodoroRoom, LeaderboardEntry, InteractionType
    next-auth.d.ts             # NextAuth session type augmentation (id, school, career)

  i18n/
    es.json                    # Spanish translations (nav, feed, auth, pomodoro, rankings, settings)
    en.json                    # English translations

prisma/
  schema.prisma                # All 18 models (see Database entities below)
  prisma.config.ts             # Prisma v7 config — datasource URL here, NOT in schema
  migrations/                  # SQL migration history (3 migrations)
```

---

## Database entities

All models in `prisma/schema.prisma`:

| Model | Purpose |
|---|---|
| **User** | Auth, profile, reputation, avatar, bio, github, linkedin, theme/lang prefs |
| **Post** | general / question / project types, thumbnailUrl, subjectTag, projectUrl |
| **Interaction** | like / upvote / repost — unique per user+post+type |
| **Comment** | threaded replies via `parentCommentId`, `isUseful` flag |
| **Note** | Personal notes — title, content, subject, `isPublic`, timestamps |
| **Follow** | `followerId` → `followingId` unique pair |
| **Notification** | type: like/upvote/comment/reply/follow/mention/message/group_post |
| **PomodoroRoom** | Legacy — name, school, timer, isBreak, cycleStart |
| **RoomParticipant** | userId + roomId join (Pomodoro legacy) |
| **QuizRoom** | Host, name, subject, isActive |
| **QuizQuestion** | options stored as JSON string, correctIndex (0-3) |
| **QuizMember** | Per-room score leaderboard |
| **QuizAnswer** | Records each user's answer, enforces one answer per question |
| **Conversation** | 1-to-1 DM thread |
| **ConversationParticipant** | Links two users to a conversation, tracks lastReadAt |
| **Message** | Text, isRead, senderId, conversationId |
| **UserBlock** | `blockerId` → `blockedId` unique pair — prevents messaging and follow |
| **Group** | Study group — name, subject, description, createdBy |
| **GroupMember** | role: "admin" or "member" |
| **GroupPost** | Group-scoped posts (not visible on global feed) |
| **GroupEvent** | Scheduled study sessions with `scheduledAt` datetime |

---

## Key design rules
1. **Zero emojis** in hardcoded UI — Lucide icons only.
2. **WCAG AA** contrast in both light and dark mode.
3. **No FOUC** — theme and language loaded from cookie before first paint via Zustand + `suppressHydrationWarning`.
4. Institutional email validation on every register attempt.
5. Only the post/note/group owner can delete their own content.
6. All protected routes check session server-side in `(main)/layout.tsx` — redirect to `/login` if unauthenticated.
7. Notifications are non-blocking — created with `Promise.allSettled` so they never break main flows.
8. Skeleton loaders instead of "Cargando…" text in all list views.

---

## Build status

### Core platform
- [x] Tailwind CSS v4 theme tokens + CSS variables (light/dark)
- [x] Prisma v7 schema (18 models, 3 migrations)
- [x] NextAuth v5 (credentials, JWT, email domain validation)
- [x] 3-column responsive layout (mobile bottom-nav / tablet icon-sidebar / desktop full-sidebar)
- [x] UAPA brand colors + dark mode persistence (cookie)
- [x] i18n ES + EN (nav, feed, auth, settings)
- [x] Skeleton loaders component (`Skeleton`, `PostSkeleton`, `NoteSkeleton`, `ConversationSkeleton`)

### Feed & Content
- [x] Feed — 3 post types (general / question / project), images, pagination
- [x] Interactions — like, upvote, repost (toggle, reputation points)
- [x] Comments — threaded replies (parentCommentId), reply button, reply-to indicator
- [x] @mention highlighting in posts and comments (blue brand color)
- [x] Post composer — image upload (Vercel Blob), subject tag, project URL
- [x] Delete own posts/notes only
- [x] Vitrina — project posts, filter by school, sort recent/popular
- [x] Apuntes — CRUD, public/private toggle, live search, skeleton loaders

### Social
- [x] User profiles `/perfil/[id]` — posts, bio, reputation, social links
- [x] Follow / Unfollow (with follower/following counters on profile)
- [x] Notifications system — in-app feed `/notificaciones`, bell badge with unread count
- [x] Notification triggers: like, upvote, comment, reply, follow, @mention, DM, group post
- [x] Block / Unblock user (from chat menu — prevents messaging)

### Messaging
- [x] Direct messages `/mensajes` — conversation list with skeleton loaders
- [x] Chat `/mensajes/[id]` — bubble UI (own = blue, other = surface), 3s polling
- [x] Message states: "Enviado" / "Leído"
- [x] "Mensaje" button on every public profile page
- [x] Block user from chat (disables input, shows "Bloqueaste a este usuario")

### Groups
- [x] Study groups `/grupos` — list, search, create, join/leave
- [x] Group detail `/grupos/[id]` — 3 tabs: Feed / Miembros / Eventos
- [x] Group feed — members-only posts, notifies all members on new post
- [x] Members tab — role badge (Admin), reputation points
- [x] Events tab — schedule study sessions with `datetime-local`, upcoming only

### Quiz Rooms (replaces Pomodoro as primary study feature)
- [x] Quiz rooms list `/quiz` — create room, join, host delete
- [x] Quiz room `/quiz/[id]` — host adds questions (4 options, mark correct)
- [x] Participants answer questions — correct = +10 pts room score, +5 reputation
- [x] Per-room leaderboard visible on desktop sidebar

### Rankings & Reputation
- [x] Rankings `/rankings` — top 20 leaderboard, medal icons for top 3
- [x] Reputation earned: comment (+1), like given (+2), upvote given (+10), quiz correct (+5)
- [x] Right panel shows top 3 contributors (desktop only)

### Infrastructure
- [x] Avatar upload to Vercel Blob (`/api/upload`)
- [x] `/api/setup-db?secret=nexouapa2024` — one-time migration runner for Turso production
- [x] Mobile bottom navigation (5 items: Home, Groups, Messages, Notifications, Settings)

### Pending / Future
- [ ] Real-time sync (WebSocket / SSE) for chat and quiz rooms
- [ ] Global search (posts + users + groups)
- [ ] Public notes feed (community apuntes)
- [ ] Push notifications (browser / PWA)
- [ ] Pomodoro real-time sync (currently legacy, rooms still in DB)
