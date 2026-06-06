export type Theme = 'light' | 'dark'
export type Lang = 'es' | 'en'
export type PostType = 'general' | 'question' | 'project'
export type InteractionType = 'like' | 'upvote' | 'repost'

export interface User {
  id: string
  name: string
  email: string
  school: string
  career: string
  bio?: string
  avatarUrl?: string
  githubUrl?: string
  linkedinUrl?: string
  reputationPoints: number
  themePreference: Theme
  langPreference: Lang
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  postType: PostType
  content: string
  subjectTag?: string
  projectUrl?: string
  thumbnailUrl?: string
  projectTitle?: string
  createdAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'school' | 'career'>
  _count: {
    likes: number
    upvotes: number
    reposts: number
    comments: number
  }
  userInteractions?: InteractionType[]
}

export interface Comment {
  id: string
  userId: string
  postId: string
  parentCommentId?: string
  commentText: string
  isUseful: boolean
  createdAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  replies?: Comment[]
}

export interface PomodoroRoom {
  id: string
  name: string
  school?: string
  subjectTag?: string
  timerSeconds: number
  isBreak: boolean
  cycleStart: string
  participantCount: number
}

export interface LeaderboardEntry {
  rank: number
  user: Pick<User, 'id' | 'name' | 'avatarUrl' | 'school' | 'career'>
  reputationPoints: number
}
