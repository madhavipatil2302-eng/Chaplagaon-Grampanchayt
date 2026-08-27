import { useEffect, useState } from 'react'
import { BarChart3, Building2, MapPin, RotateCcw, Save } from 'lucide-react'

import Toast from '../components/Toast'
import { getVillageStatistics, saveVillageStatistics, updateVillageStatistics } from '../Services/moduleDataService'

const emptyVillageStatistics = {
  totalPopulation: '',
  malePopulation: '',
  femalePopulation: '',
  totalHouseholds: '',
  areaSqKm: '',
  literacyRate: '',
}

const statisticsFields = [
  { name: 'totalPopulation', label: 'Total Population', icon: BarChart3, type: 'number' },
  { name: 'malePopulation', label: 'Male Population', icon: BarChart3, type: 'number' },
  { name: 'femalePopulation', label: 'Female Population', icon: BarChart3, type: 'number' },
  { name: 'totalHouseholds', label: 'Total Households', icon: Building2, type: 'number' },
  { name: 'areaSqKm', label: 'Area (Sq. Km.)', icon: MapPin, type: 'number', step: 'any' },
  { name: 'literacyRate', label: 'Literacy Rate (%)', icon: BarChart3, type: 'number', step: 'any' },
]

function StatisticsField({ field, onChange, value }) {
  const Icon = field.icon

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
        <Icon className="h-4 w-4 text-emerald-800" />
        {field.label}
      </span>
      <input
        className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
        name={field.name}
        onChange={onChange}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        step={field.step}
        type={field.type}
        value={value}
      />
    </label>
  )
}

function VillageStatistics() {
  const [formData, setFormData] = useState(emptyVillageStatistics)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadStatistics() {
      const result = await getVillageStatistics()

      if (result.success && Array.isArray(result.data) && result.data[0]) {
        setFormData({
          ...emptyVillageStatistics,
          ...result.data[0],
        })
      }
    }

    loadStatistics()
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

  function handleReset() {
    setFormData(emptyVillageStatistics)
    showToast({ message: 'Village statistics reset successfully.', type: 'success' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = formData._id ? await updateVillageStatistics(formData._id, formData) : await saveVillageStatistics(formData)

    if (result.success && result.data) {
      setFormData({
        ...emptyVillageStatistics,
        ...result.data,
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
        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Village Statistics</p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">Population, Households & Area</h2>
        <p className="mt-3 text-sm font-bold text-emerald-100">Add village population, household, area and literacy details.</p>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Village Statistics</p>
          <h3 className="mt-2 text-xl font-black text-neutral-950">Population, Households & Area</h3>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {statisticsFields.map((field) => (
            <StatisticsField field={field} key={field.name} onChange={handleChange} value={formData[field.name]} />
          ))}
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
          {saving ? 'Saving...' : 'Save Village Statistics'}
        </button>
      </div>
    </form>
  )
}

export default VillageStatistics
