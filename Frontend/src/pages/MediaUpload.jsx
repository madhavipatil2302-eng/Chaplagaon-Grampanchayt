import { useEffect, useState } from 'react'
import { CalendarDays, FileImage, ImageUp, RotateCcw, Save, Tag, Type } from 'lucide-react'

import Toast from '../components/Toast'
import { getMediaUploads, saveMediaUpload } from '../Services/moduleDataService'
import { resolveAssetUrl } from '../Services/homeservices'

const emptyMediaData = {
  title: '',
  category: '',
  mediaDate: '',
  description: '',
  mediaFile: null,
  mediaPreview: '',
  mediaFileName: '',
}

const categoryOptions = ['Gallery', 'Event', 'Notice', 'Development Work', 'Document']

function MediaUpload() {
  const [mediaData, setMediaData] = useState(emptyMediaData)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadMedia() {
      const result = await getMediaUploads()

      if (result.success && Array.isArray(result.data) && result.data[0]) {
        const latestMedia = result.data[0]

        setMediaData({
          ...emptyMediaData,
          ...latestMedia,
          mediaDate: latestMedia.mediaDate ? latestMedia.mediaDate.slice(0, 10) : '',
          mediaFile: null,
          mediaPreview: latestMedia.mediaMimeType?.startsWith('image/') ? resolveAssetUrl(latestMedia.mediaFile) : '',
        })
      }
    }

    loadMedia()
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setMediaData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null

    if (!file) {
      setMediaData((currentData) => ({
        ...currentData,
        mediaFile: null,
        mediaPreview: resolveAssetUrl(currentData.mediaFile),
      }))
      return
    }

    setMediaData((currentData) => ({
      ...currentData,
      mediaFile: file,
      mediaPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      mediaFileName: file.name,
    }))
  }

  function handleReset() {
    setMediaData(emptyMediaData)
    showToast({ message: 'Media upload form reset successfully.', type: 'success' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = await saveMediaUpload(mediaData)

    if (result.success && result.data) {
      setMediaData({
        ...emptyMediaData,
        ...result.data,
        mediaDate: result.data.mediaDate ? result.data.mediaDate.slice(0, 10) : '',
        mediaFile: null,
        mediaPreview: result.data.mediaMimeType?.startsWith('image/') ? resolveAssetUrl(result.data.mediaFile) : '',
      })
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />

      <section className="rounded-lg border border-emerald-100 bg-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Media Upload</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">{mediaData.title || 'Add Media Details'}</h2>
        <p className="mt-3 text-sm font-bold text-emerald-100">Upload photos, documents and event media for Gram Panchayat records.</p>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-black text-neutral-950">Media Details</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <Type className="h-4 w-4 text-emerald-800" />
              Title
            </span>
            <input
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="title"
              onChange={handleChange}
              placeholder="Enter media title"
              type="text"
              value={mediaData.title}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <Tag className="h-4 w-4 text-emerald-800" />
              Category
            </span>
            <select
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="category"
              onChange={handleChange}
              value={mediaData.category}
            >
              <option value="">Select category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <CalendarDays className="h-4 w-4 text-emerald-800" />
              Media Date
            </span>
            <input
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="mediaDate"
              onChange={handleChange}
              type="date"
              value={mediaData.mediaDate}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <ImageUp className="h-4 w-4 text-emerald-800" />
              Upload Media
            </span>
            <input
              accept="image/*,.pdf,.doc,.docx"
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-emerald-900"
              onChange={handleFileChange}
              type="file"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Description</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="description"
              onChange={handleChange}
              placeholder="Enter media description"
              value={mediaData.description}
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-black text-neutral-950">Preview</h3>
        <div className="mt-5 grid min-h-48 place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5">
          {mediaData.mediaPreview ? (
            <div
              aria-label={mediaData.title || 'Media preview'}
              className="h-56 w-full rounded-lg bg-contain bg-center bg-no-repeat"
              role="img"
              style={{ backgroundImage: `url("${mediaData.mediaPreview}")` }}
            />
          ) : (
            <div className="text-center text-sm font-bold text-neutral-500">
              <FileImage className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
              {mediaData.mediaFileName || 'Upload image to preview. Documents will show file name here.'}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 text-sm font-black text-neutral-800 transition hover:bg-neutral-50"
          onClick={handleReset}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-800 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900"
          type="submit"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Media'}
        </button>
      </div>
    </form>
  )
}

export default MediaUpload
