'use client'

import { X, ArrowRight } from 'lucide-react'

interface Template {
  _id: string
  name: string
  thumbnailUrl: string
  isPaid: boolean
  price: number
}

interface Props {
  template: Template
  onClose: () => void
  onUse: () => void
}

export default function TemplatePreviewModal({ template, onClose, onUse }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-bold text-gray-900">{template.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              template.isPaid ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {template.isPaid ? `Paid · ${template.price} ETB` : 'Free'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview area */}
        <div className="bg-gray-50 flex items-center justify-center min-h-80 p-6">
          {template.thumbnailUrl ? (
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="max-h-96 max-w-full object-contain rounded-lg shadow"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <span className="text-6xl">📄</span>
              <p className="text-sm">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            Close
          </button>
          <button
            onClick={onUse}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <ArrowRight className="w-4 h-4" /> Use Template
          </button>
        </div>
      </div>
    </div>
  )
}
