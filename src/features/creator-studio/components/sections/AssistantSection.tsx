import { useEffect, useRef, useState, type FormEvent } from 'react'
import { suggestedQuestions } from '../../data/creatorStudio'
import { useCreatorStudio } from '../../hooks/useCreatorStudioState'
import { SendIcon } from '../icons'
import { SectionHeading } from '../shared'

export function AssistantSection() {
  const creator = useCreatorStudio()
  const { assistantMessages, askAssistant } = creator

  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current

    if (list) {
      list.scrollTop = list.scrollHeight
    }
  }, [assistantMessages])

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = query.trim()
    if (!trimmed) return

    askAssistant(trimmed)
    setQuery('')
  }

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Creator studio"
        title="AI financial assistant"
        description="Ask about earnings, expenses, invoices, payouts or customers. Answers come from your recorded transactions — never invented estimates."
      />

      <div className="rounded-2xl border border-white/10 bg-slate-900">
        <div
          ref={listRef}
          className="h-96 space-y-4 overflow-y-auto p-6"
          aria-live="polite"
        >
          {assistantMessages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
              }
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-teal-400 text-slate-950'
                    : 'border border-white/10 bg-slate-950/60 text-slate-200'
                }`}
              >
                {message.text.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-1.5' : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => askAssistant(question)}
                className="shrink-0 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400 transition hover:border-teal-400/40 hover:text-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about your money — e.g. How much did I earn from tips in October?"
              aria-label="Ask the financial assistant"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              aria-label="Send question"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SendIcon className="h-4 w-4" />
              Ask
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        The assistant reads your Creator Studio ledger — transactions, expenses,
        invoices, payouts and customers. If the records do not support an answer,
        it says so instead of guessing.
      </p>
    </section>
  )
}
