import { useEffect, useMemo, useState } from 'react'
import { Download, Edit3, FileText, Filter, Save, Trash2, X } from 'lucide-react'

import Toast from '../components/Toast'
import { deleteMediaUpload, getPublicMediaUploads, resolveAssetUrl, updateMediaUpload } from '../Services/homeservices'

function getTokenRole() {
  const token = localStorage.getItem('accesstoken')

  if (!token) {
    return ''
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    return decodedPayload?.role || ''
  } catch {
    return ''
  }
}

function formatDate(value) {
  if (!value) {
    return 'Date not added'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function isImageMedia(media) {
  return media?.mediaMimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(media?.mediaFile || '')
}

function MediaDialog({ media, onClose }) {
  if (!media) {
    return null
  }

  const mediaUrl = resolveAssetUrl(media.mediaFile)
  const isImage = isImageMedia(media)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6" onClick={onClose}>
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-emerald-800">{media.category || 'Gallery'}</p>
            <h3 className="mt-1 truncate text-2xl font-black text-slate-950">{media.title || media.mediaFileName || 'Untitled media'}</h3>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={onClose} title="Close" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="bg-slate-100">
            <div className="grid min-h-72 place-items-center text-emerald-900">
              {isImage && mediaUrl ? (
                <img alt={media.title || media.mediaFile || 'Gallery media'} className="h-full min-h-72 w-full object-cover" src={mediaUrl} />
              ) : (
                <FileText className="h-16 w-16" />
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-800">{media.category || 'Gallery'}</span>
              <p className="text-sm font-black text-emerald-950">{formatDate(media.mediaDate)}</p>
            </div>

            <p className="mt-5 text-sm font-semibold leading-7 text-slate-600">{media.description || 'No description available.'}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Category</p>
                <p className="mt-2 text-sm font-black text-slate-900">{media.category || 'Gallery'}</p>
              </div>
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Media Date</p>
                <p className="mt-2 text-sm font-black text-slate-900">{formatDate(media.mediaDate)}</p>
              </div>
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase text-slate-400">File Name</p>
                <p className="mt-2 break-words text-sm font-black text-slate-900">{media.mediaFileName || 'Not specified'}</p>
              </div>
            </div>

            {mediaUrl && (
              <a
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-black text-white hover:bg-emerald-900"
                href={mediaUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                Open Media
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Gallery() {
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingMedia, setEditingMedia] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const isApplicationAdmin = getTokenRole() === 'ApplicationAdmin'

  useEffect(() => {
    loadMedia()
  }, [])

  const categoryOptions = useMemo(() => {
    return [...new Set(mediaItems.map((item) => item.category || 'Gallery'))]
  }, [mediaItems])

  const filteredMedia = useMemo(() => {
    if (categoryFilter === 'all') {
      return mediaItems
    }

    return mediaItems.filter((item) => (item.category || 'Gallery') === categoryFilter)
  }, [categoryFilter, mediaItems])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  async function loadMedia() {
    const result = await getPublicMediaUploads()

    if (result.success && Array.isArray(result.data)) {
      setMediaItems(result.data)
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setLoading(false)
  }

  function handleMediaKeyDown(event, media) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedMedia(media)
    }
  }

  function handleEditChange(event) {
    const { name, value } = event.target

    setEditingMedia((currentMedia) => ({
      ...currentMedia,
      [name]: value,
    }))
  }

  function handleEditFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setEditingMedia((currentMedia) => ({
      ...currentMedia,
      mediaFile: file,
      mediaFileName: file.name,
      mediaMimeType: file.type,
      mediaPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }))
  }

  async function handleUpdate(event) {
    event.preventDefault()
    setSaving(true)

    const result = await updateMediaUpload(editingMedia._id, editingMedia)

    if (result.success && result.data) {
      setMediaItems((currentItems) => currentItems.map((item) => (item._id === result.data._id ? result.data : item)))
      setEditingMedia(null)
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  async function handleDelete(mediaId) {
    const result = await deleteMediaUpload(mediaId)

    if (result.success) {
      setMediaItems((currentItems) => currentItems.filter((item) => item._id !== mediaId))
      if (selectedMedia?._id === mediaId) {
        setSelectedMedia(null)
      }
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#f4faf8] px-4 py-6 text-slate-950 sm:-m-8 sm:px-8 sm:py-8">
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />
      <MediaDialog media={selectedMedia} onClose={() => setSelectedMedia(null)} />

      <section className="rounded-lg bg-[#eaf5f3] p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black text-emerald-900">Village Media</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Gallery</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              View photos and documents uploaded by admin. Click any media card to see details.
            </p>
          </div>

          <label className="inline-flex h-12 w-full max-w-56 items-center gap-2 rounded-lg bg-emerald-950 px-4 text-sm font-black text-white md:w-auto">
            <Filter className="h-4 w-4" />
            <select className="min-w-0 flex-1 bg-transparent text-white outline-none" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
              <option className="text-slate-900" value="all">Filter</option>
              {categoryOptions.map((category) => (
                <option className="text-slate-900" key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">Loading gallery...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">No media uploaded yet.</div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMedia.map((media) => {
            const mediaUrl = resolveAssetUrl(media.mediaFile)
            const isImage = isImageMedia(media)

            return (
              <article
                className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100"
                key={media._id}
                onClick={() => setSelectedMedia(media)}
                onKeyDown={(event) => handleMediaKeyDown(event, media)}
                role="button"
                tabIndex={0}
              >
                <div className="relative">
                  <div className="grid h-56 place-items-center bg-[#dfeaf4] text-emerald-900">
                    {isImage && mediaUrl ? (
                      <img alt={media.title || media.mediaFileName || 'Gallery media'} className="h-full w-full object-cover" src={mediaUrl} />
                    ) : (
                      <FileText className="h-12 w-12" />
                    )}
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-800 px-4 py-2 text-xs font-black text-white shadow-sm">
                    {media.category || 'Gallery'}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-black text-emerald-800">{formatDate(media.mediaDate)}</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">{media.title || media.mediaFileName || 'Untitled media'}</h3>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                    {media.description || 'No description available.'}
                  </p>
                  <p className="mt-auto pt-5 text-xs font-black uppercase text-emerald-800">Click to view details</p>

                  {isApplicationAdmin && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-xs font-black text-neutral-800 transition hover:bg-neutral-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          setEditingMedia({
                            ...media,
                            mediaDate: media.mediaDate ? media.mediaDate.slice(0, 10) : '',
                            mediaFile: null,
                            mediaPreview: isImage ? mediaUrl : '',
                          })
                        }}
                        type="button"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(media._id)
                        }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editingMedia && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6" onClick={() => setEditingMedia(null)}>
          <form className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()} onSubmit={handleUpdate}>
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <h3 className="text-xl font-black text-neutral-950">Edit Media</h3>
              <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-neutral-100" onClick={() => setEditingMedia(null)} type="button">
                <X size={21} />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <input className="h-12 rounded-lg border border-neutral-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="title" onChange={handleEditChange} placeholder="Title" value={editingMedia.title || ''} />
              <input className="h-12 rounded-lg border border-neutral-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="category" onChange={handleEditChange} placeholder="Category" value={editingMedia.category || ''} />
              <input className="h-12 rounded-lg border border-neutral-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="mediaDate" onChange={handleEditChange} type="date" value={editingMedia.mediaDate || ''} />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Upload Media File</span>
                <input
                  accept="image/*,.pdf,.doc,.docx"
                  className="h-12 w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm font-bold outline-none focus:border-emerald-700"
                  name="mediaFile"
                  onChange={handleEditFileChange}
                  type="file"
                />
                {editingMedia.mediaPreview && (
                  <img alt="Selected media preview" className="mt-3 h-40 w-full rounded-lg object-cover" src={editingMedia.mediaPreview} />
                )}
              </label>
              <textarea className="min-h-28 rounded-lg border border-neutral-200 p-4 text-sm font-bold outline-none focus:border-emerald-700 md:col-span-2" name="description" onChange={handleEditChange} placeholder="Description" value={editingMedia.description || ''} />
            </div>

            <div className="flex justify-end border-t border-neutral-100 px-6 py-4">
              <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-black text-white disabled:opacity-60" disabled={saving} type="submit">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Gallery
