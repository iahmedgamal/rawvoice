import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { humanizeText } from '../server/humanize'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleHumanize() {
    if (!input.trim() || loading) return
    setLoading(true)
    setOutput('')
    try {
      const res = await humanizeText({ data: { text: input } })
      setOutput(res.text)
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

  return (
    <main className="rv-main">
      <div className="rv-grain" aria-hidden="true" />

      <header className="rv-header">
        <h1 className="rv-logo">RawVoice</h1>
        <p className="rv-tagline">Paste your text. Make it sound human.</p>
      </header>

      <div className="rv-panels">
        <div className="rv-pane">
          <span className="rv-label">Your text</span>
          <textarea
            className="rv-textarea"
            placeholder="Paste AI-generated or stiff text here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="rv-mid">
          <div className="rv-mid-line" />
          <button
            type="button"
            className="rv-btn"
            onClick={handleHumanize}
            disabled={!input.trim() || loading}
            data-loading={loading || undefined}
          >
            {loading ? 'Rewriting…' : 'Make It Human'}
          </button>
          <div className="rv-mid-line" />
        </div>

        <div className="rv-pane">
          <div className="rv-pane-top">
            <span className="rv-label">Humanized</span>
            {output && !loading && (
              <button type="button" className="rv-copy" onClick={handleCopy}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            )}
          </div>
          {loading ? (
            <div className="rv-skeleton">
              <div className="rv-skeleton-line" style={{ width: '92%' }} />
              <div className="rv-skeleton-line" style={{ width: '78%' }} />
              <div className="rv-skeleton-line" style={{ width: '88%' }} />
              <div className="rv-skeleton-line" style={{ width: '65%' }} />
              <div className="rv-skeleton-line" style={{ width: '83%' }} />
              <div className="rv-skeleton-line" style={{ width: '55%' }} />
            </div>
          ) : (
            <textarea
              className="rv-textarea rv-textarea-out"
              placeholder="Your humanized text will appear here…"
              value={output}
              readOnly
            />
          )}
        </div>
      </div>
    </main>
  )
}
