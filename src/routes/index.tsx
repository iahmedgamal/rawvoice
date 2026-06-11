import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { humanizeText, getRemaining } from '../server/humanize'

export const Route = createFileRoute('/')({ component: App })

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [displayedOutput, setDisplayedOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    getRemaining().then((r) => setRemaining(r.remaining)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!output) { setDisplayedOutput(''); return }
    const STEPS = 40
    const DURATION = 700
    const chunkSize = Math.max(1, Math.ceil(output.length / STEPS))
    let step = 0
    const id = setInterval(() => {
      step++
      setDisplayedOutput(output.slice(0, step * chunkSize))
      if (step >= STEPS || step * chunkSize >= output.length) clearInterval(id)
    }, DURATION / STEPS)
    return () => clearInterval(id)
  }, [output])

  async function handleHumanize() {
    if (!input.trim() || loading) return
    setLoading(true)
    setOutput('')
    try {
      const res = await humanizeText({ data: { text: input } })
      setOutput(res.text)
      setRemaining(res.remaining)
    } catch (err) {
      console.error('humanize error:', err)
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inWords = wordCount(input)
  const outWords = wordCount(displayedOutput)

  return (
    <main className="rv-main">
      <div className="rv-grain" aria-hidden="true" />
      <div className="rv-bg-glow" aria-hidden="true" />

      <header className="rv-header">
        <div className="rv-logo-mark" aria-hidden="true" />
        <h1 className="rv-logo">RawVoice</h1>
        <p className="rv-tagline">Paste your text. Make it sound human.</p>
      </header>

      <div className="rv-panels">
        <div className="rv-pane">
          <div className="rv-pane-top">
            <span className="rv-label">Your text</span>
            {inWords > 0 && (
              <span className="rv-wordcount">{inWords} {inWords === 1 ? 'word' : 'words'}</span>
            )}
          </div>
          <textarea
            className="rv-textarea"
            placeholder="Paste AI-generated or stiff text here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="rv-mid">
          <div className="rv-mid-line" />
          <div className="rv-mid-btn-wrap">
            <button
              type="button"
              className="rv-btn"
              onClick={handleHumanize}
              disabled={!input.trim() || loading}
              data-loading={loading || undefined}
              aria-label={loading ? 'Rewriting…' : 'Humanize text'}
            >
              {loading ? (
                <svg className="rv-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <svg className="rv-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>
            <span className="rv-mid-label">{loading ? 'Rewriting…' : 'Humanize'}</span>
            {remaining !== null && !loading && (
              <span className="rv-uses-left">{remaining} left today</span>
            )}
          </div>
          <div className="rv-mid-line" />
        </div>

        <div className="rv-pane">
          <div className="rv-pane-top">
            <span className="rv-label">Humanized</span>
            <div className="rv-pane-actions">
              {displayedOutput && !loading && (
                <span className="rv-wordcount">{outWords} {outWords === 1 ? 'word' : 'words'}</span>
              )}
              {output && !loading && (
                <button type="button" className="rv-copy" onClick={handleCopy}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="rv-skeleton">
              {[92, 78, 88, 65, 83, 55].map((w, i) => (
                <div key={i} className="rv-skeleton-line" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <textarea
              className="rv-textarea rv-textarea-out"
              placeholder="Your humanized text will appear here…"
              value={displayedOutput}
              readOnly
            />
          )}
        </div>
      </div>
    </main>
  )
}
