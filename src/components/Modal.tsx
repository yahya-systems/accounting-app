import { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-black">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-sm">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
