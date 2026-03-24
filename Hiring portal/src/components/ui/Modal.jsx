import { AnimatePresence, motion as Motion } from 'framer-motion'

export function Modal({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <Motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Motion.div
            className="my-auto w-full max-w-4xl rounded-2xl border border-gray-800 bg-gray-900/95 p-6 shadow-xl backdrop-blur sm:my-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button className="text-gray-400 transition hover:text-white" onClick={onClose}>
                Close
              </button>
            </div>
            {children}
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}
