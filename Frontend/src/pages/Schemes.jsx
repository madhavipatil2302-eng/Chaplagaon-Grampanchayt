import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Download, FileCheck2, Filter, GraduationCap, HeartPulse, Home, Info, Landmark, Plus, Save, ShieldCheck, Sprout, X } from 'lucide-react'

import Toast from '../components/Toast'
import { deleteScheme, getPublicSchemes, saveScheme, updateScheme } from '../Services/homeservices'

const emptyScheme = {
  schemeName: '',
  schemeCode: '',
  category: '',
  description: '',
  eligibility: '',
  requiredDocuments: '',
  applicationMode: '',
  applicationLink: '',
  startDate: '',
  endDate: '',
  status: 'Active',
}

const categoryCardsConfig = [
  { category: 'Agriculture', description: 'Initiatives for farmers', icon: Sprout, status: 'Active', style: { bg: 'bg-emerald-50', text: 'text-emerald-800' } },
  { category: 'Housing', description: 'Home and shelter schemes', icon: Home, status: 'Active', style: { bg: 'bg-cyan-50', text: 'text-cyan-800' } },
  { category: 'Education', description: 'Scholarships and aid', icon: GraduationCap, status: 'Upcoming', style: { bg: 'bg-amber-50', text: 'text-amber-800' } },
  { category: 'Health', description: 'Public health facilities', icon: HeartPulse, status: 'Active', style: { bg: 'bg-rose-50', text: 'text-rose-800' } },
  { category: 'Banking', description: 'Bank accounts and loans', icon: Landmark, status: 'Active', style: { bg: 'bg-indigo-50', text: 'text-indigo-800' } },
  { category: 'Investment', description: 'Savings and investment aid', icon: FileCheck2, status: 'Active', style: { bg: 'bg-lime-50', text: 'text-lime-800' } },
  { category: 'Social Welfare', description: 'Support for eligible citizens', icon: ShieldCheck, status: 'Active', style: { bg: 'bg-violet-50', text: 'text-violet-800' } },
  { category: 'Employment', description: 'Jobs and skill programs', icon: FileCheck2, status: 'Active', style: { bg: 'bg-orange-50', text: 'text-orange-800' } },
  { category: 'Women & Child', description: 'Women and child welfare', icon: HeartPulse, status: 'Active', style: { bg: 'bg-pink-50', text: 'text-pink-800' } },
  { category: 'Senior Citizen', description: 'Pension and senior support', icon: ShieldCheck, status: 'Active', style: { bg: 'bg-slate-100', text: 'text-slate-800' } },
]

const categoryOptions = categoryCardsConfig.map((card) => card.category)

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

function toInputDate(value) {
  return value ? value.slice(0, 10) : ''
}

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function normalizeSchemeForForm(scheme) {
  return {
    ...emptyScheme,
    ...scheme,
    applicationMode: scheme?.applicationMode || '',
    applicationLink: scheme?.applicationLink || '',
    eligibility: scheme?.eligibility || '',
    requiredDocuments: Array.isArray(scheme?.requiredDocuments) ? scheme.requiredDocuments.join('\n') : scheme?.requiredDocuments || '',
    startDate: toInputDate(scheme?.startDate),
    endDate: toInputDate(scheme?.endDate),
    status: scheme?.status || 'Active',
  }
}

function toListItems(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        String(item)
          .split(/\|\||\n|,/)
          .map((nextItem) => nextItem.trim())
      )
      .filter(Boolean)
  }

  if (!value) {
    return []
  }

  return String(value)
    .split(/\|\||\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getStatusClass(status = '') {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes('upcoming')) {
    return 'bg-amber-100 text-amber-800'
  }

  if (normalizedStatus.includes('closed') || normalizedStatus.includes('inactive')) {
    return 'bg-slate-100 text-slate-700'
  }

  return 'bg-emerald-100 text-emerald-800'
}

function SchemeForm({ formData, onCancel, onChange, onSubmit, saving }) {
  return (
    <form className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-950">{formData._id ? 'Edit Scheme' : 'Add Scheme'}</h3>
        <button className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-emerald-50" onClick={onCancel} type="button">
          <X size={20} />
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="schemeName" onChange={onChange} placeholder="Scheme Name" value={formData.schemeName} />
        <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="schemeCode" onChange={onChange} placeholder="Scheme Code" value={formData.schemeCode} />
        <select className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="category" onChange={onChange} value={formData.category}>
          <option value="">Select Category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="applicationMode" onChange={onChange} value={formData.applicationMode}>
          <option value="">Application Mode</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Both">Both</option>
        </select>
        <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="applicationLink" onChange={onChange} placeholder="Application Link" type="url" value={formData.applicationLink} />
        <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="startDate" onChange={onChange} type="date" value={formData.startDate} />
        <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="endDate" onChange={onChange} type="date" value={formData.endDate} />
        <select className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-600" name="status" onChange={onChange} value={formData.status}>
          <option value="Active">Active</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Inactive">Inactive</option>
          <option value="Closed">Closed</option>
        </select>
        <textarea className="min-h-28 rounded-lg border border-slate-200 p-4 text-sm font-bold outline-none focus:border-emerald-600 md:col-span-2" name="description" onChange={onChange} placeholder="Description" value={formData.description} />
        <textarea className="min-h-24 rounded-lg border border-slate-200 p-4 text-sm font-bold outline-none focus:border-emerald-600 md:col-span-2" name="eligibility" onChange={onChange} placeholder="Eligibility criteria, one point per line" value={formData.eligibility} />
        <textarea className="min-h-24 rounded-lg border border-slate-200 p-4 text-sm font-bold outline-none focus:border-emerald-600 md:col-span-2" name="requiredDocuments" onChange={onChange} placeholder="Required documents, one document per line" value={formData.requiredDocuments} />
      </div>

      <div className="mt-5 flex justify-end">
        <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-950 px-5 text-sm font-black text-white hover:bg-emerald-900 disabled:opacity-60 sm:w-auto" disabled={saving} type="submit">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Scheme'}
        </button>
      </div>
    </form>
  )
}

function SchemeDialog({ onClose, scheme }) {
  if (!scheme) {
    return null
  }

  const eligibilityItems = toListItems(scheme.eligibility)
  const documentItems = toListItems(scheme.requiredDocuments)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-3 sm:p-6" onClick={onClose}>
      <section
        className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        style={{
          height: 'min(620px, calc(100dvh - 2rem))',
          width: 'clamp(320px, 56vw, 720px)',
        }}
      >
        <header className="shrink-0 bg-emerald-950 px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase text-emerald-900">
                  {scheme.category || 'General'}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase text-emerald-50 ring-1 ring-white/15">
                  {scheme.status || 'Active'}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-black leading-tight">{scheme.schemeName || 'Untitled Scheme'}</h3>
              {scheme.schemeCode && <p className="mt-2 truncate text-xs font-bold text-emerald-100">Scheme Code: {scheme.schemeCode}</p>}
            </div>
            <button className="absolute right-4 top-4 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20" onClick={onClose} title="Close" type="button">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 pb-20">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#eef4ff] p-3">
              <p className="text-[11px] font-black uppercase text-slate-400">Mode</p>
              <p className="mt-2 text-sm font-black text-emerald-950">{scheme.applicationMode || 'Not specified'}</p>
            </div>
            <div className="rounded-lg bg-[#eef4ff] p-3">
              <p className="text-[11px] font-black uppercase text-slate-400">Start</p>
              <p className="mt-2 text-sm font-black text-emerald-950">{formatDate(scheme.startDate)}</p>
            </div>
            <div className="rounded-lg bg-[#eef4ff] p-3">
              <p className="text-[11px] font-black uppercase text-slate-400">End</p>
              <p className="mt-2 text-sm font-black text-emerald-950">{formatDate(scheme.endDate)}</p>
            </div>
            <div className="rounded-lg bg-[#eef4ff] p-3">
              <p className="text-[11px] font-black uppercase text-slate-400">Target</p>
              <p className="mt-2 text-sm font-black text-emerald-950">{scheme.targetGroup || 'Eligible citizens'}</p>
            </div>
          </div>

          <section className="mt-5">
            <h4 className="border-l-4 border-emerald-700 pl-3 text-base font-black text-emerald-950">Scheme Information</h4>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{scheme.description || 'No scheme information available.'}</p>
          </section>

          <div className="mt-5 grid gap-4">
            <section className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-black text-emerald-950">
                Eligibility
              </h4>
              {eligibilityItems.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-700">
                  {eligibilityItems.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-emerald-200 text-[10px] font-black text-emerald-800">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-500">Eligibility details not added.</p>
              )}
            </section>

            <section className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-black text-emerald-950">
                Required Documents
              </h4>
              {documentItems.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-700">
                  {documentItems.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-lg bg-slate-50 text-[10px] font-black text-slate-500">□</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm font-semibold text-slate-500">Required documents not added.</p>
              )}
            </section>
          </div>
        </div>

        <footer className="absolute inset-x-0 bottom-0 border-t border-emerald-100 bg-[#eaf2ff] p-3">
          {scheme.applicationLink && (
            <a className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-950 px-5 text-sm font-black text-white hover:bg-emerald-900" href={scheme.applicationLink} rel="noreferrer" target="_blank">
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </footer>
      </section>
    </div>
  )
}

function Schemes() {
  const [schemes, setSchemes] = useState([])
  const [formData, setFormData] = useState(emptyScheme)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState(categoryOptions[0])
  const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0])
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const isApplicationAdmin = getTokenRole() === 'ApplicationAdmin'

  useEffect(() => {
    loadSchemes()
  }, [])

  const selectedCategorySchemes = useMemo(() => {
    if (!selectedCategory) {
      return []
    }

    return schemes.filter((scheme) => (scheme.category || 'General') === selectedCategory)
  }, [selectedCategory, schemes])

  const categoryCards = useMemo(() => {
    return categoryCardsConfig.map((card) => ({
      ...card,
      count: schemes.filter((scheme) => (scheme.category || 'General') === card.category).length,
    }))
  }, [schemes])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  async function loadSchemes() {
    const result = await getPublicSchemes()

    if (result.success && Array.isArray(result.data)) {
      setSchemes(result.data)
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setLoading(false)
  }

  function handleChange(event) {
    const { checked, name, type, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleEdit(scheme) {
    setSelectedScheme(null)
    setFormData(normalizeSchemeForForm(scheme))
    setShowForm(true)
  }

  function handleCancel() {
    setFormData(emptyScheme)
    setShowForm(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = formData._id ? await updateScheme(formData._id, formData) : await saveScheme(formData)

    if (result.success && result.data) {
      setSchemes((currentSchemes) =>
        formData._id
          ? currentSchemes.map((scheme) => (scheme._id === result.data._id ? result.data : scheme))
          : [result.data, ...currentSchemes]
      )
      setFormData(emptyScheme)
      setShowForm(false)
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  async function handleDelete(schemeId) {
    const result = await deleteScheme(schemeId)

    if (result.success) {
      setSchemes((currentSchemes) => currentSchemes.filter((scheme) => scheme._id !== schemeId))
      if (selectedScheme?._id === schemeId) {
        setSelectedScheme(null)
      }
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#f7f9fc] px-4 py-5 text-slate-950 sm:-m-8 sm:px-8 sm:py-8">
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />
      <SchemeDialog onClose={() => setSelectedScheme(null)} scheme={selectedScheme} />

      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">Benefits / Schemes &gt; Government Schemes</p>
          <h2 className="mt-2 text-2xl font-black text-emerald-950 sm:text-4xl">Government Schemes List</h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            View information, eligibility, and application status for all available welfare schemes.
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-3 md:w-auto">
          <label className="inline-flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm sm:w-auto">
            <Filter className="h-4 w-4" />
            <select
              className="bg-transparent outline-none"
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setSelectedCategory(event.target.value === 'all' ? '' : event.target.value)
              }}
              value={categoryFilter}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm sm:w-auto" type="button">
            <Download className="h-4 w-4" />
            Download Report
          </button>
          {isApplicationAdmin && (
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-950 px-5 text-sm font-black text-white shadow-sm hover:bg-emerald-900 sm:w-auto" onClick={() => setShowForm(true)} type="button">
              <Plus className="h-4 w-4" />
              Add Scheme
            </button>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {categoryCards.map((card) => {
          const Icon = card.icon

          return (
            <article
              className={`cursor-pointer rounded-lg bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                selectedCategory === card.category ? 'ring-4 ring-emerald-100' : 'ring-slate-100'
              }`}
              key={card.category}
              onClick={() => {
                setSelectedCategory(card.category)
                setCategoryFilter(card.category)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedCategory(card.category)
                  setCategoryFilter(card.category)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={`grid h-11 w-11 place-items-center rounded-lg ${card.style.bg} ${card.style.text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-black text-emerald-950">{card.category}</h3>
              <p className="mt-1 min-h-9 text-xs font-bold leading-5 text-slate-500">{card.description}</p>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-2xl font-black text-emerald-950">{card.count}</span>
                <span className={`rounded px-2 py-1 text-[11px] font-black ${getStatusClass(card.status)}`}>{card.status}</span>
              </div>
            </article>
          )
        })}
      </section>

      {isApplicationAdmin && showForm && (
        <div className="mt-6">
          <SchemeForm formData={formData} onCancel={handleCancel} onChange={handleChange} onSubmit={handleSubmit} saving={saving} />
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">Loading schemes...</div>
      ) : !selectedCategory ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">
          Click a category card to see its schemes.
        </div>
      ) : selectedCategorySchemes.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">No schemes found for {selectedCategory}.</div>
      ) : (
        <section className="mt-6 space-y-5">
          {selectedCategorySchemes.map((scheme) => (
            <article
              className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100"
              key={scheme._id}
              onClick={() => setSelectedScheme(scheme)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedScheme(scheme)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="grid gap-5 border-l-4 border-emerald-800 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-800">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-emerald-950">{scheme.schemeName || 'Untitled Scheme'}</h3>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black ${getStatusClass(scheme.status)}`}>
                        {scheme.status || 'Active'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Scheme Code: {scheme.schemeCode || 'Not set'} | Department: {scheme.category || 'General'}
                    </p>
                    <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-600">
                      {scheme.description || 'No scheme information available.'}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-3">
                      <p><span className="block text-xs font-black uppercase text-slate-400">Application Mode</span>{scheme.applicationMode || 'Not specified'}</p>
                      <p><span className="block text-xs font-black uppercase text-slate-400">Start Date</span>{formatDate(scheme.startDate)}</p>
                      <p><span className="block text-xs font-black uppercase text-slate-400">Eligibility</span>{toListItems(scheme.eligibility)[0] || 'See details'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-40">
                  {scheme.applicationLink && (
                    <a
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-950 px-5 text-sm font-black text-white hover:bg-emerald-900"
                      href={scheme.applicationLink}
                      onClick={(event) => event.stopPropagation()}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-900 px-5 text-sm font-black text-emerald-950 hover:bg-emerald-50" type="button">
                    View Details
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isApplicationAdmin && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-800 hover:bg-slate-50"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleEdit(scheme)
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 hover:bg-red-100"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(scheme._id)
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  )
}

export default Schemes
