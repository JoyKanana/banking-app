import { useEffect } from 'react'
import { CloseIcon } from '../icons'
import { CopyButton } from '../shared/CopyButton'

type QrCodeDialogProps = {
  url: string
  title: string
  onClose: () => void
}

function cellFilled(seed: string, row: number, column: number): boolean {
  const input = `${seed}:${row}:${column}`
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 9973
  }

  return hash % 2 === 0
}

function isFinderPattern(row: number, column: number, size: number): boolean {
  function inSquare(startRow: number, startColumn: number): boolean {
    if (row < startRow || row > startRow + 6) return false
    if (column < startColumn || column > startColumn + 6) return false

    const localRow = row - startRow
    const localColumn = column - startColumn
    const onRing =
      localRow === 0 ||
      localRow === 6 ||
      localColumn === 0 ||
      localColumn === 6
    const inCore = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4

    return onRing || inCore
  }

  const sizeOffset = size - 7
  return (
    inSquare(0, 0) ||
    inSquare(0, sizeOffset) ||
    inSquare(sizeOffset, 0)
  )
}

export function QrCodeDialog({ url, title, onClose }: QrCodeDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const size = 21
  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size)
    const column = index % size
    return isFinderPattern(row, column, size) || cellFilled(url, row, column)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="qr-title" className="text-xl font-semibold">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Customers scan this code to open the payment page.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-auto w-full"
            role="img"
            aria-label={`QR code for ${url}`}
          >
            {cells.map((filled, index) =>
              filled ? (
                <rect
                  key={index}
                  x={index % size}
                  y={Math.floor(index / size)}
                  width={1}
                  height={1}
                  fill="#0f172a"
                />
              ) : null,
            )}
          </svg>
        </div>

        <p className="mt-4 break-all text-center font-mono text-xs text-slate-400">
          {url}
        </p>

        <div className="mt-4 flex justify-center">
          <CopyButton value={url} label="Copy link" />
        </div>
      </div>
    </div>
  )
}
