'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Send, MoreVertical, ShieldX } from 'lucide-react'

interface Msg {
  id: string
  text: string
  isRead: boolean
  createdAt: string
  senderId: string
  sender: { id: string; name: string; avatarUrl?: string | null }
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatarUrl?: string | null } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`)
    if (!res.ok) return
    const data = await res.json()
    setMessages(data.messages ?? [])
    // Derive other user from messages
    if (!otherUser && session?.user?.id) {
      const other = (data.messages as Msg[]).find((m) => m.senderId !== session.user!.id)
      if (other) setOtherUser(other.sender)
    }
  }, [conversationId, otherUser, session?.user?.id])

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Load block status
  useEffect(() => {
    if (otherUser?.id) {
      fetch(`/api/users/${otherUser.id}/block`)
        .then((r) => r.json())
        .then((d) => setIsBlocked(d.isBlocked ?? false))
    }
  }, [otherUser?.id])

  async function sendMessage() {
    if (!text.trim() || sending || isBlocked) return
    const textToSend = text.trim()
    setSending(true)
    setText('')

    // Optimistic update
    const tempMsg: Msg = {
      id:        `temp-${Date.now()}`,
      text:      textToSend,
      isRead:    false,
      createdAt: new Date().toISOString(),
      senderId:  session?.user?.id ?? '',
      sender:    { id: session?.user?.id ?? '', name: session?.user?.name ?? '', avatarUrl: null },
    }
    setMessages((prev) => [...prev, tempMsg])

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSend }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessages((prev) => prev.map((m) => m.id === tempMsg.id ? data.message : m))
    }
    setSending(false)
    inputRef.current?.focus()
  }

  async function toggleBlock() {
    if (!otherUser || blockLoading) return
    setBlockLoading(true)
    const res = await fetch(`/api/users/${otherUser.id}/block`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setIsBlocked(data.blocked)
    }
    setBlockLoading(false)
    setShowMenu(false)
  }

  const myId = session?.user?.id

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/mensajes" className="p-1.5 rounded-full" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
        </Link>

        {otherUser && (
          <>
            {otherUser.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                {otherUser.name[0]?.toUpperCase()}
              </div>
            )}
            <Link href={`/perfil/${otherUser.id}`} className="flex-1 font-semibold text-sm hover:underline" style={{ color: 'var(--text-primary)' }}>
              {otherUser.name}
            </Link>
          </>
        )}

        {/* Menu */}
        <div className="relative ml-auto">
          <button onClick={() => setShowMenu((v) => !v)} className="p-1.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-8 z-20 rounded-xl shadow-lg py-1 min-w-[160px]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={toggleBlock}
                disabled={blockLoading}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors"
                style={{ color: isBlocked ? 'var(--text-primary)' : '#ef4444' }}
              >
                <ShieldX size={14} />
                {isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" onClick={() => setShowMenu(false)}>
        {isBlocked && (
          <div className="text-center py-3">
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Has bloqueado a este usuario
            </span>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.senderId === myId
          const showTime = i === 0 || new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 300000
          return (
            <div key={msg.id}>
              {showTime && (
                <div className="text-center my-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
                    {fmtTime(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                  style={isMine
                    ? { background: 'var(--brand-primary)', color: '#fff', borderBottomRightRadius: '6px' }
                    : { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderBottomLeftRadius: '6px' }
                  }
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  {isMine && (
                    <p className="text-right text-[10px] mt-0.5 opacity-75">
                      {msg.isRead ? 'Leído' : 'Enviado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3 flex items-end gap-3"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder={isBlocked ? 'Bloqueaste a este usuario' : 'Escribe un mensaje…'}
          disabled={isBlocked}
          className="flex-1 resize-none text-sm rounded-xl px-3 py-2 outline-none overflow-hidden disabled:opacity-50"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', minHeight: '38px', maxHeight: '120px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending || isBlocked}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: 'var(--brand-primary)', color: '#fff' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
