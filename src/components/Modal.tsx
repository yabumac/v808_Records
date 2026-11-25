import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  children,
  title,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-surface text-ink border border-line shadow-2xl w-full ${maxWidth} rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {title && <h3 className="text-xl font-bold mb-4 pr-8">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
