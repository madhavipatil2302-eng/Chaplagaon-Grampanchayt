import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileSignature,
  GraduationCap,
  Hash,
  ImageUp,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Vote,
} from 'lucide-react'

import Toast from '../components/Toast'
import { roleOptions } from '../constants/roles'
import { ManageRole } from '../Services/RoleManamentService'

const emptyRoleData = {
  fullName: '',
  role: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  villageName: '',
  wardNumber: '',
  education: '',
  occupation: '',
  joiningDate: '',
  termStartDate: '',
  termEndDate: '',
  status: '',
  responsibilities: '',
  bio: '',
  electionYear: '',
  politicalGroup: '',
  totalVotes: '',
  priorityProjects: '',
  pass: '',
  profilePhoto: null,
  profilePhotoPreview: '',
  signature: null,
  signaturePreview: '',
}


const personalFields = [
  { name: 'fullName', label: 'Full Name', icon: UserRound },
  { name: 'role', label: 'Role', icon: ShieldCheck, options: roleOptions, type: 'select' },
  { name: 'gender', label: 'Gender', icon: UserRound },
  { name: 'dateOfBirth', label: 'Date of Birth', icon: CalendarDays, type: 'date' },
  { name: 'education', label: 'Education', icon: GraduationCap },
  { name: 'occupation', label: 'Occupation', icon: BriefcaseBusiness },
]

const contactFields = [
  { name: 'mobileNumber', label: 'Mobile Number', icon: Phone },
  { name: 'alternateMobileNumber', label: 'Alternate Mobile Number', icon: Phone },
  { name: 'email', label: 'Email', icon: Mail, type: 'email' },
  { name: 'address', label: 'Address', icon: MapPin },
  { name: 'villageName', label: 'Village Name', icon: MapPin },
  { name: 'wardNumber', label: 'Ward Number', icon: Hash },
]

const roleFields = [
  { name: 'joiningDate', label: 'Joining Date', icon: CalendarDays, type: 'date' },
  { name: 'termStartDate', label: 'Term Start Date', icon: CalendarDays, type: 'date' },
  { name: 'termEndDate', label: 'Term End Date', icon: CalendarDays, type: 'date' },
  { name: 'status', label: 'Status', icon: BadgeCheck },
  { name: 'electionYear', label: 'Election Year', icon: Vote },
  { name: 'politicalGroup', label: 'Political Group', icon: Vote },
  { name: 'totalVotes', label: 'Total Votes', icon: Vote, type: 'number' },
  { name: 'pass', label: 'Password / Pass', icon: ShieldCheck },
]

function Field({ field, onChange, value }) {
  const Icon = field.icon

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
        <Icon className="h-4 w-4 text-emerald-800" />
        {field.label}
      </span>
      {field.type === 'select' ? (
        <select
          className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
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
      ) : (
      <input
        className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
        name={field.name}
        onChange={onChange}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        type={field.type || 'text'}
        value={value}
      />
      )}
    </label>
  )
}

function FieldGroup({ data, fields, onChange, title }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-neutral-950">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <Field field={field} key={field.name} onChange={onChange} value={data[field.name]} />
        ))}
      </div>
    </section>
  )
}

function FileField({ fileName, icon: Icon, label, name, onChange, preview }) {
  return (
    <label className="block rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <span className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
        <Icon className="h-4 w-4 text-emerald-800" />
        {label}
      </span>
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
        <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-emerald-800">
          {preview ? (
            <img alt={label} className="h-full w-full object-cover" src={preview} />
          ) : (
            <Icon className="h-10 w-10" />
          )}
        </div>
        <div>
          <input
            accept="image/*"
            className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            name={name}
            onChange={onChange}
            type="file"
          />
          <p className="mt-2 break-words text-xs font-bold text-neutral-500">{fileName || 'No file selected'}</p>
        </div>
      </div>
    </label>
  )
}

function RoleManagement() {
  const location = useLocation()
  const navigate = useNavigate()
  const [roleData, setRoleData] = useState(emptyRoleData)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    if (location.state?.toast) {
      showToast({ message: location.state.toast, type: 'success' })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setRoleData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleFileChange(event) {
    const { files, name } = event.target
    const file = files?.[0]

    if (!file) {
      return
    }

    setRoleData((currentData) => ({
      ...currentData,
      [name]: file,
      [`${name}Preview`]: URL.createObjectURL(file),
    }))
  }

  function handleReset() {
    setRoleData(emptyRoleData)
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const payload = {
      ...roleData,
      totalVotes: roleData.totalVotes ? Number(roleData.totalVotes) : '',
      priorityProjects: roleData.priorityProjects
        .split('\n')
        .map((project) => project.trim())
        .filter(Boolean),
    }

    const formData = new FormData()

    Object.entries(payload).forEach(([key, value]) => {
      if (key.endsWith('Preview')) {
        return
      }

      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
        return
      }

      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    const result = await ManageRole(formData)

    if (result.success) {
      setMessage(result.message)
      showToast({ message: result.message || 'Role details saved successfully.', type: 'success' })
    } else {
      setError(result.message)
      showToast({ message: result.message || 'Unable to save role details.', type: 'error' })
    }

    setLoading(false)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />
      <section className="rounded-lg border border-emerald-100 bg-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid h-28 w-28 place-items-center rounded-lg border border-white/20 bg-white/10">
            {roleData.profilePhotoPreview ? (
              <img alt={roleData.fullName || 'Role member'} className="h-full w-full rounded-lg object-cover" src={roleData.profilePhotoPreview} />
            ) : (
              <UserRound className="h-12 w-12 text-emerald-100" />
            )}
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Role Management</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{roleData.fullName || 'Add New Role Member'}</h2>
            <p className="mt-3 text-sm font-bold text-emerald-100">
              {roleData.responsibilities || 'Admin can add member role details from this form.'}
            </p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-emerald-100">Current Role</p>
            <p className="mt-2 text-2xl font-black">{roleData.role || 'Not assigned'}</p>
            <p className="mt-1 text-sm font-bold text-emerald-100">{roleData.status || 'Status pending'}</p>
          </div>
        </div>
      </section>

      <FieldGroup data={roleData} fields={personalFields} onChange={handleChange} title="Personal Information" />
      <FieldGroup data={roleData} fields={contactFields} onChange={handleChange} title="Contact Information" />
      <FieldGroup data={roleData} fields={roleFields} onChange={handleChange} title="Role & Election Information" />

      <section className="grid gap-6 xl:grid-cols-2">
        <FileField
          fileName={roleData.profilePhoto?.name}
          icon={ImageUp}
          label="Upload Profile Photo"
          name="profilePhoto"
          onChange={handleFileChange}
          preview={roleData.profilePhotoPreview}
        />
        <FileField
          fileName={roleData.signature?.name}
          icon={FileSignature}
          label="Upload Signature"
          name="signature"
          onChange={handleFileChange}
          preview={roleData.signaturePreview}
        />
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-black text-neutral-950">
            <ClipboardList className="h-5 w-5 text-emerald-800" />
            Responsibilities & Bio
          </h3>
          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Responsibilities</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="responsibilities"
              onChange={handleChange}
              placeholder="Enter responsibilities"
              value={roleData.responsibilities}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Bio</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="bio"
              onChange={handleChange}
              placeholder="Enter bio"
              value={roleData.bio}
            />
          </label>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-neutral-950">Priority Projects</h3>
          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Priority Projects</span>
            <textarea
              className="min-h-36 w-full rounded-lg border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="priorityProjects"
              onChange={handleChange}
              placeholder="Enter one project per line"
              value={roleData.priorityProjects}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          className="h-12 rounded-lg border border-neutral-200 bg-white px-6 text-sm font-black text-neutral-800 transition hover:bg-neutral-50"
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
        <button
          className="h-12 rounded-lg bg-emerald-800 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Saving...' : 'Save Role Details'}
        </button>
      </div>
    </form>
  )
}

export default RoleManagement
