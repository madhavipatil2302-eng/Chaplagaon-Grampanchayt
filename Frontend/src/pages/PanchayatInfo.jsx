import { useEffect, useState } from 'react'
import { Building2, Hash, ImageUp, Link, MapPin, RotateCcw, Save, Trash2 } from 'lucide-react'

import Toast from '../components/Toast'
import { deletePanchayatInfo, getPanchayatInfos, savePanchayatInfo, updatePanchayatInfo } from '../Services/moduleDataService'
import { resolveAssetUrl } from '../Services/homeservices'

const emptyPanchayatInfo = {
  gramPanchayatName: '',
  villageName: '',
  gpCode: '',
  establishmentYear: '',
  panchayatType: '',
  registrationNumber: '',
  officeAddress: '',
  taluka: '',
  district: '',
  state: '',
  pinCode: '',
  latitude: '',
  longitude: '',
  googleMapLink: '',
  panchayatImage: null,
  panchayatImagePreview: '',
  panchayatImageName: '',
}

const panchayatFields = [
  { name: 'gramPanchayatName', label: 'Gram Panchayat Name', icon: Building2 },
  { name: 'villageName', label: 'Village Name', icon: MapPin },
  { name: 'gpCode', label: 'GP Code (LGD Code)', icon: Hash },
  { name: 'establishmentYear', label: 'Establishment Year', icon: Hash, type: 'number' },
  {
    name: 'panchayatType',
    label: 'Panchayat Type',
    icon: Building2,
    type: 'select',
    options: [
      { label: 'Gram', value: 'Gram' },
      { label: 'Nagar', value: 'Nagar' },
    ],
  },
  { name: 'registrationNumber', label: 'Registration Number', icon: Hash },
  { name: 'officeAddress', label: 'Office Address', icon: MapPin, type: 'textarea', full: true },
  { name: 'taluka', label: 'Taluka', icon: MapPin },
  { name: 'district', label: 'District', icon: MapPin },
  { name: 'state', label: 'State', icon: MapPin },
  { name: 'pinCode', label: 'PIN Code', icon: Hash, type: 'number' },
  { name: 'latitude', label: 'Latitude', icon: MapPin, type: 'number', step: 'any' },
  { name: 'longitude', label: 'Longitude', icon: MapPin, type: 'number', step: 'any' },
  { name: 'googleMapLink', label: 'Google Map Link', icon: Link, type: 'url', full: true },
]

function FormField({ field, onChange, value }) {
  const Icon = field.icon
  const fieldClass = field.full ? 'block md:col-span-2' : 'block'
  const controlClass =
    'w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100'

  return (
    <label className={fieldClass}>
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
        <Icon className="h-4 w-4 text-emerald-800" />
        {field.label}
      </span>

      {field.type === 'select' ? (
        <select
          className={`${controlClass} h-12`}
          name={field.name}
          onChange={onChange}
          value={value}
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          className={`${controlClass} min-h-28 py-3`}
          name={field.name}
          onChange={onChange}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          value={value}
        />
      ) : (
        <input
          className={`${controlClass} h-12`}
          name={field.name}
          onChange={onChange}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          step={field.step}
          type={field.type || 'text'}
          value={value}
        />
      )}
    </label>
  )
}

function FieldSection({ fields, formData, onChange, subtitle, title }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">{subtitle}</p>
        <h3 className="mt-2 text-xl font-black text-neutral-950">{title}</h3>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <FormField field={field} key={field.name} onChange={onChange} value={formData[field.name]} />
        ))}
      </div>
    </section>
  )
}

function PanchayatInfo() {
  const [formData, setFormData] = useState(emptyPanchayatInfo)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadPanchayatInfo() {
      const result = await getPanchayatInfos()

      if (result.success && Array.isArray(result.data) && result.data[0]) {
        setFormData({
          ...emptyPanchayatInfo,
          ...result.data[0],
          panchayatImage: null,
          panchayatImagePreview: resolveAssetUrl(result.data[0].panchayatImage),
        })
      }
    }

    loadPanchayatInfo()
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null

    if (!file) {
      setFormData((currentData) => ({
        ...currentData,
        panchayatImage: null,
        panchayatImagePreview: resolveAssetUrl(currentData.panchayatImage),
        panchayatImageName: currentData.panchayatImageName || '',
      }))
      return
    }

    const objectUrl = URL.createObjectURL(file)

    setFormData((currentData) => ({
      ...currentData,
      panchayatImage: file,
      panchayatImagePreview: objectUrl,
      panchayatImageName: file.name,
    }))

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((currentData) => ({
        ...currentData,
        panchayatImagePreview: typeof reader.result === 'string' ? reader.result : '',
      }))
    }
    reader.onerror = () => {
      setFormData((currentData) => ({
        ...currentData,
        panchayatImagePreview: objectUrl,
      }))
    }
    reader.readAsDataURL(file)
  }

  function handleReset() {
    setFormData(emptyPanchayatInfo)
    showToast({ message: 'Panchayat form reset successfully.', type: 'success' })
  }

  async function handleDelete() {
    if (!formData._id) {
      handleReset()
      return
    }

    setDeleting(true)

    const result = await deletePanchayatInfo(formData._id)

    if (result.success) {
      setFormData(emptyPanchayatInfo)
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setDeleting(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = formData._id ? await updatePanchayatInfo(formData._id, formData) : await savePanchayatInfo(formData)

    if (result.success && result.data) {
      setFormData({
        ...emptyPanchayatInfo,
        ...result.data,
        panchayatImage: null,
        panchayatImagePreview: resolveAssetUrl(result.data.panchayatImage),
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
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Panchayat Information</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              {formData.gramPanchayatName || 'Add Gram Panchayat Details'}
            </h2>
            <p className="mt-3 text-sm font-bold text-emerald-100">{formData.villageName || 'Basic information form.'}</p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-emerald-100">Panchayat Type</p>
            <p className="mt-2 text-2xl font-black">{formData.panchayatType || 'Not selected'}</p>
            <p className="mt-1 text-sm font-bold text-emerald-100">{formData.taluka || 'Taluka pending'}</p>
          </div>
        </div>
      </section>

      <FieldSection
        fields={panchayatFields}
        formData={formData}
        onChange={handleChange}
        subtitle="Basic Details"
        title="Gram Panchayat Details"
      />

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-black text-neutral-950">Panchayat Image</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-[18rem_1fr] lg:items-center">
          <div className="grid min-h-48 place-items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
            {formData.panchayatImagePreview ? (
              <div
                aria-label={formData.gramPanchayatName || 'Panchayat preview'}
                className="h-40 w-full rounded-lg bg-contain bg-center bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url("${formData.panchayatImagePreview}")` }}
              />
            ) : (
              <div className="text-center text-sm font-bold text-neutral-500">
                <ImageUp className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
                {formData.panchayatImageName || 'No panchayat image selected'}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <ImageUp className="h-4 w-4 text-emerald-800" />
              Upload Panchayat Image
            </span>
            <input
              accept="image/*"
              className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-emerald-900"
              onChange={handleImageChange}
              type="file"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={deleting}
          onClick={handleDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 text-sm font-black text-neutral-800 transition hover:bg-neutral-50"
          onClick={handleReset}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-800 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Panchayat Details'}
        </button>
      </div>
    </form>
  )
}

export default PanchayatInfo
