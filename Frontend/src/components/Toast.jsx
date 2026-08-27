function Toast({ message, onClose, type = 'success' }) {
  if (!message) {
    return null
  }

  const isError = type === 'error'

  return (
    <div className="fixed right-4 top-28 z-50 w-[min(24rem,calc(100vw-2rem))]">
      <div
        className={`rounded-lg border px-4 py-3 text-sm font-black shadow-xl ${
          isError
            ? 'border-red-200 bg-red-50 text-red-700 shadow-red-950/10'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-950/10'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <p>{message}</p>
          <button className="text-lg leading-none opacity-70 hover:opacity-100" onClick={onClose} type="button">
            x
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast
