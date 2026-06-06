@AGENTS.md

# NEXO UAPA — Project Context for AI Assistants

## What this project is
NEXO UAPA is a community, productivity and academic interaction platform for students of Universidad Abierta para Adultos (UAPA). It mirrors the layout of X/Twitter (3-column) but is academic-focused. The PRD is in `PRD_NEXO_UAPA.md`.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS variables for theming
- **Icons**: Lucide React (NO emojis in UI code, ever)
- **Real-time**: Socket.io (client-side in Next.js, server in `server/`)
- **DB**: PostgreSQL via Prisma ORM
- **Cache / Pomodoro sync**: Redis (ioredis)
- **Auth**: NextAuth.js v5 (email/password + institutional email validation)
- **State**: Zustand for client state, React Query (TanStack) for server state

## Folder structure
```
src/
  app/                   # Next.js App Router pages
    (auth)/              # Login / Register
    (main)/              # Authenticated layout (3-column)
      feed/              # Module B — Feed
      vitrina/           # Projects showcase
      pomodoro/          # Module C — Co-working rooms
      rankings/          # Module D — Leaderboard
      settings/          # Module A — User settings
  components/
    ui/                  # Reusable primitives (Button, Card, Avatar…)
    feed/                # Feed-specific components
    pomodoro/            # Timer, room, chat components
    layout/              # Sidebar, RightPanel, TopBar
  lib/
    db.ts                # Prisma client singleton
    redis.ts             # Redis client singleton
    auth.ts              # NextAuth config
    socket.ts            # Socket.io client helper
  hooks/                 # Custom React hooks
  stores/                # Zustand stores
  types/                 # Shared TypeScript types
  i18n/                  # es.json / en.json translation dictionaries
prisma/
  schema.prisma          # DB schema (Users, Posts, Interactions, Comments, Rooms)
server/
  index.ts               # Express + Socket.io server for Pomodoro sync
```

## Key design rules (from PRD)
1. **Zero emojis** in hardcoded UI — use Lucide icons only.
2. **WCAG AA** contrast in dark mode.
3. **No FOUC** — theme/language loaded from cookie before first paint.
4. Institutional email validation on register (`@uapa.edu.do` or similar).
5. WebSocket rooms must clean up on disconnect to avoid memory leaks.
6. Pomodoro timer runs on the **server** (authoritative), clients read from Redis.

## Modules build order
1. A — Auth + Settings (login, register, theme toggle, language)
2. B — Feed (post creation, 3 types, interactions: like/upvote/repost/comment)
3. C — Pomodoro rooms (WebSocket, Redis timer, break-only chat)
4. D — Gamification / Rankings (reputation algorithm, leaderboard widget)

## UAPA Brand colors
- Primary: `#003C82` (UAPA institutional blue)
- Accent: `#F5A623` (orange)
- Background light: `#F7F9FC`
- Background dark: `#0D1117`
- Text primary light: `#0D1117`
- Text primary dark: `#E6EDF3`

## Database entities (Prisma)
See `prisma/schema.prisma`. Tables: User, Post, Interaction, Comment, PomodoroRoom, RoomParticipant.

## Current build status
- [ ] Tailwind theme tokens configured
- [ ] Prisma schema created
- [ ] NextAuth setup
- [ ] 3-column layout shell
- [ ] Feed module
- [ ] Pomodoro module
- [ ] Rankings module
- [ ] i18n dictionaries
- [ ] Dark mode persistence
