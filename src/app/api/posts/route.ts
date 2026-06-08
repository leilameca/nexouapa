import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cursor   = searchParams.get('cursor') ?? undefined
    const type     = searchParams.get('type') ?? undefined
    const userId   = searchParams.get('userId') ?? undefined
    const take     = 20

    const posts = await db.post.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: {
        ...(type   ? { postType: type } : {}),
        ...(userId ? { userId }         : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, school: true, career: true, avatarUrl: true },
        },
        _count: {
          select: { interactions: true, comments: true },
        },
      },
    })

    // Get authenticated user's interactions for these posts
    const session = await auth()
    let userInteractionMap: Record<string, string[]> = {}

    if (session?.user?.id) {
      const myInteractions = await db.interaction.findMany({
        where: {
          userId: session.user.id,
          postId: { in: posts.map((p) => p.id) },
        },
        select: { postId: true, interactionType: true },
      })
      for (const i of myInteractions) {
        if (!userInteractionMap[i.postId]) userInteractionMap[i.postId] = []
        userInteractionMap[i.postId].push(i.interactionType)
      }
    }

    // Reshape counts by interactionType
    const shaped = await Promise.all(
      posts.map(async (post) => {
        const counts = await db.interaction.groupBy({
          by: ['interactionType'],
          where: { postId: post.id },
          _count: true,
        })
        const byType: Record<string, number> = { like: 0, upvote: 0, repost: 0 }
        for (const c of counts) byType[c.interactionType] = c._count

        return {
          id:           post.id,
          userId:       post.userId,
          postType:     post.postType,
          content:      post.content,
          subjectTag:   post.subjectTag,
          projectTitle: post.projectTitle,
          projectUrl:   post.projectUrl,
          thumbnailUrl: post.thumbnailUrl,
          createdAt:    post.createdAt.toISOString(),
          user:         post.user,
          _count: {
            likes:    byType.like,
            upvotes:  byType.upvote,
            reposts:  byType.repost,
            comments: post._count.comments,
          },
          userInteractions: userInteractionMap[post.id] ?? [],
        }
      })
    )

    const nextCursor = posts.length === take ? posts[posts.length - 1].id : null
    return NextResponse.json({ posts: shaped, nextCursor })
  } catch {
    return NextResponse.json({ error: 'Error al obtener posts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { postType, content, subjectTag, projectTitle, projectUrl, thumbnailUrl } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 })
    }
    if (!['general', 'question', 'project'].includes(postType)) {
      return NextResponse.json({ error: 'Tipo de post inválido' }, { status: 400 })
    }
    if (postType === 'question' && !subjectTag) {
      return NextResponse.json({ error: 'Las preguntas requieren una asignatura' }, { status: 400 })
    }

    const post = await db.post.create({
      data: {
        userId:       session.user.id,
        postType,
        content,
        subjectTag:   subjectTag   ?? null,
        projectTitle: projectTitle ?? null,
        projectUrl:   projectUrl   ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
      },
      include: {
        user: {
          select: { id: true, name: true, school: true, career: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json({
      id:           post.id,
      userId:       post.userId,
      postType:     post.postType,
      content:      post.content,
      subjectTag:   post.subjectTag,
      projectTitle: post.projectTitle,
      projectUrl:   post.projectUrl,
      thumbnailUrl: post.thumbnailUrl,
      createdAt:    post.createdAt.toISOString(),
      user:         post.user,
      _count:       { likes: 0, upvotes: 0, reposts: 0, comments: 0 },
      userInteractions: [],
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear post' }, { status: 500 })
  }
}
