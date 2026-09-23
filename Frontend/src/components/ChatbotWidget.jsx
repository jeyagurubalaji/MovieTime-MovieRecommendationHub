import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'
import { aiService } from '../services/aiService'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your MovieTime assistant. Ask me what to watch, or tell me a mood — I'll find something.", suggested_movies: [] },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', content: text, suggested_movies: [] }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const history = nextMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
      const data = await aiService.chat(text, history)
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, suggested_movies: data.suggested_movies || [] }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Sorry, I couldn't connect just now. Try again in a moment.", suggested_movies: [] }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 60,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'var(--gold)', color: '#14161F', fontSize: 24,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', cursor: 'pointer',
        }}
      >
        {open ? '✕' : '🎬'}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'fixed', bottom: 92, right: 24, zIndex: 60,
            width: 360, maxWidth: 'calc(100vw - 48px)', height: 480,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em' }}>
              What Should I Watch Tonight?
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                    background: m.role === 'user' ? 'var(--gold)' : 'var(--surface-raised)',
                    color: m.role === 'user' ? '#14161F' : 'var(--text)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {m.content}
                </div>

                {m.suggested_movies?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 8, maxWidth: '100%' }}>
                    {m.suggested_movies.map((movie) => (
                      <Link key={movie.id} to={`/movie/${movie.id}`} onClick={() => setOpen(false)} style={{ flexShrink: 0, width: 72 }}>
                        {movie.poster_path ? (
                          <img src={posterUrl(movie.poster_path, 'w185')} alt={movie.title} style={{ width: '100%', borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 72, height: 108, background: 'var(--surface-raised)', borderRadius: 6 }} />
                        )}
                        <div style={{ fontSize: 10, marginTop: 4, lineHeight: 1.3 }}>{movie.title}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sending && <div className="muted" style={{ fontSize: 12 }}>Thinking…</div>}
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recommendation…"
              style={{
                flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '10px 12px', color: 'var(--text)', fontSize: 13,
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 13 }} disabled={sending}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
