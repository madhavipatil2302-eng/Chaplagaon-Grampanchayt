import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Droplets,
  FileText,
  GalleryHorizontalEnd,
  Home,
  ImageUp,
  Info,
  Landmark,
  Mail,
  Megaphone,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

import Toast from '../components/Toast'
import { getPermissionMatrix, updatePermissionMatrix } from '../Services/permissionService'

const permissionOptions = [
  'Allowed',
  'CRUD',
  'View/Edit',
  'View',
  'Edit',
  'Manage',
  'Create',
  'Apply',
  'Approve',
  'Apply/Track',
  'Entry',
  'Pay/View',
  'View/Bill',
  'Assign/Resolve',
  'Update',
  'Monitor',
  'Upload',
  'Publish',
  'Draft',
  'Denied',
]

const defaultRoles = [
  { key: 'admin', label: 'Admin' },
  { key: 'sarpanch', label: 'Sarpanch' },
  { key: 'deputySarpanch', label: 'Deputy Sarpanch' },
  { key: 'gramsevak', label: 'Gramsevak' },
  { key: 'dataEntry', label: 'Data Entry' },
  { key: 'citizen', label: 'Citizen' },
]

const defaultModules = [
  {
    moduleKey: 'home',
    moduleName: 'Home',
    permissions: {
      admin: 'CRUD',
      sarpanch: 'Allowed',
      deputySarpanch: 'Allowed',
      gramsevak: 'Allowed',
      dataEntry: 'Allowed',
      citizen: 'View',
    },
  },
  {
    moduleKey: 'panchayatInfo',
    moduleName: 'Panchayat Info',
    permissions: { admin: 'CRUD', sarpanch: 'View/Edit', deputySarpanch: 'View', gramsevak: 'Edit', dataEntry: 'View', citizen: 'View' },
  },
  {
    moduleKey: 'villageStatistics',
    moduleName: 'Village Statistics',
    permissions: { admin: 'CRUD', sarpanch: 'View', deputySarpanch: 'View', gramsevak: 'Edit', dataEntry: 'Edit', citizen: 'View' },
  },
  {
    moduleKey: 'citizenServices',
    moduleName: 'Citizen Services',
    permissions: { admin: 'CRUD', sarpanch: 'View', deputySarpanch: 'View', gramsevak: 'Manage', dataEntry: 'Create', citizen: 'View' },
  },
  {
    moduleKey: 'birthDeathRegistration',
    moduleName: 'Birth & Death Registration',
    permissions: { admin: 'CRUD', sarpanch: 'Approve', deputySarpanch: 'View', gramsevak: 'CRUD', dataEntry: 'Create', citizen: 'View' },
  },
  {
    moduleKey: 'propertyTax',
    moduleName: 'Property Tax',
    permissions: { admin: 'CRUD', sarpanch: 'View', deputySarpanch: 'View', gramsevak: 'CRUD', dataEntry: 'Entry', citizen: 'View' },
  },
  {
    moduleKey: 'waterSupply',
    moduleName: 'Water Supply',
    permissions: { admin: 'CRUD', sarpanch: 'View', deputySarpanch: 'View', gramsevak: 'CRUD', dataEntry: 'Entry', citizen: 'View' },
  },
  {
    moduleKey: 'complaints',
    moduleName: 'Complaints',
    permissions: { admin: 'CRUD', sarpanch: 'View', deputySarpanch: 'View', gramsevak: 'Assign/Resolve', dataEntry: 'Update', citizen: 'View' },
  },
  {
    moduleKey: 'schemes',
    moduleName: 'Schemes',
    permissions: { admin: 'CRUD', sarpanch: 'Approve', deputySarpanch: 'View', gramsevak: 'CRUD', dataEntry: 'Entry', citizen: 'View' },
  },
  {
    moduleKey: 'ongoingProjects',
    moduleName: 'Ongoing Projects',
    permissions: { admin: 'CRUD', sarpanch: 'Approve', deputySarpanch: 'Monitor', gramsevak: 'Update', dataEntry: 'Entry', citizen: 'View' },
  },
  {
    moduleKey: 'mediaUpload',
    moduleName: 'Media Upload',
    permissions: { admin: 'CRUD', sarpanch: 'Upload', deputySarpanch: 'Upload', gramsevak: 'Upload', dataEntry: 'Upload', citizen: 'View' },
  },
  {
    moduleKey: 'gallery',
    moduleName: 'Gallery',
    permissions: { admin: 'CRUD', sarpanch: 'Upload', deputySarpanch: 'Upload', gramsevak: 'Upload', dataEntry: 'Upload', citizen: 'View' },
  },
  {
    moduleKey: 'noticeBoard',
    moduleName: 'Notice Board',
    permissions: { admin: 'CRUD', sarpanch: 'Publish', deputySarpanch: 'Publish', gramsevak: 'Create', dataEntry: 'Draft', citizen: 'View' },
  },
  {
    moduleKey: 'contact',
    moduleName: 'Contact',
    permissions: { admin: 'CRUD', sarpanch: 'Edit', deputySarpanch: 'View', gramsevak: 'Edit', dataEntry: 'View', citizen: 'View' },
  },
  {
    moduleKey: 'roleManagement',
    moduleName: 'Role Management',
    permissions: { admin: 'CRUD', sarpanch: 'Denied', deputySarpanch: 'Denied', gramsevak: 'Denied', dataEntry: 'Denied', citizen: 'View' },
  },
]

const moduleIcons = {
  birthDeathRegistration: FileText,
  citizenServices: Users,
  complaints: Megaphone,
  contact: Mail,
  gallery: GalleryHorizontalEnd,
  home: Home,
  mediaUpload: ImageUp,
  noticeBoard: Bell,
  ongoingProjects: BriefcaseBusiness,
  panchayatInfo: Info,
  propertyTax: Landmark,
  roleManagement: Settings2,
  schemes: ShieldCheck,
  villageStatistics: BarChart3,
  waterSupply: Droplets,
}

function enforceMatrixPolicy(matrixModules) {
  return matrixModules.map((module) => ({
    ...module,
    permissions: {
      ...module.permissions,
      admin: 'CRUD',
      citizen: 'View',
    },
  }))
}

function PermissionCell({ moduleKey, onChange, roleKey, value }) {
  const isDenied = value === 'Denied'
  const isAllowed = value === 'Allowed'
  const isLocked = roleKey === 'admin' || roleKey === 'citizen'

  return (
    <td className="min-w-36 border-b border-white/10 px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-2">
        {isDenied ? (
          <X className="h-5 w-5 text-rose-400" />
        ) : isAllowed ? (
          <BadgeCheck className="h-5 w-5 text-emerald-400" />
        ) : null}
        <select
          className={`h-9 min-w-28 rounded-lg border px-2 text-center text-sm font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-80 ${
            isLocked
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : isDenied
              ? 'border-rose-400/30 bg-rose-500/10 text-rose-300'
              : 'border-white/10 bg-white/5 text-white focus:border-emerald-400'
          }`}
          disabled={isLocked}
          onChange={(event) => onChange(moduleKey, roleKey, event.target.value)}
          value={value || ''}
        >
          <option className="bg-neutral-950 text-white" value="">
            None
          </option>
          {permissionOptions.map((option) => (
            <option className="bg-neutral-950 text-white" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </td>
  )
}

function PermissionMatrix() {
  const [roles, setRoles] = useState(defaultRoles)
  const [modules, setModules] = useState(defaultModules)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadMatrix() {
      const result = await getPermissionMatrix()

      if (result.success && result.data) {
        setRoles(Array.isArray(result.data.roles) && result.data.roles.length > 0 ? result.data.roles : defaultRoles)
        setModules(
          enforceMatrixPolicy(
            Array.isArray(result.data.modules) && result.data.modules.length > 0 ? result.data.modules : defaultModules
          )
        )
      } else {
        showToast({ message: result.message, type: 'error' })
      }

      setLoading(false)
    }

    loadMatrix()
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handlePermissionChange(moduleKey, roleKey, value) {
    if (roleKey === 'admin' || roleKey === 'citizen') {
      return
    }

    setModules((currentModules) =>
      currentModules.map((module) =>
        module.moduleKey === moduleKey
          ? {
              ...module,
              permissions: {
                ...module.permissions,
                [roleKey]: value,
              },
            }
          : module
      )
    )
  }

  function handleResetDefaults() {
    setRoles(defaultRoles)
    setModules(enforceMatrixPolicy(defaultModules))
    showToast({ message: 'Default permissions restored. Click save to update backend.', type: 'success' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = await updatePermissionMatrix(enforceMatrixPolicy(modules))

    if (result.success && result.data) {
      setRoles(Array.isArray(result.data.roles) && result.data.roles.length > 0 ? result.data.roles : defaultRoles)
      setModules(
        enforceMatrixPolicy(
          Array.isArray(result.data.modules) && result.data.modules.length > 0 ? result.data.modules : defaultModules
        )
      )
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="rounded-lg bg-white p-6 text-sm font-bold text-neutral-600">Loading permission matrix...</div>
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />

      <section className="rounded-lg border border-neutral-900 bg-black p-6 text-white shadow-xl shadow-neutral-950/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Role Permissions</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Module Access Matrix</h2>
            <p className="mt-3 text-sm font-bold text-neutral-300">Manage module permissions for every role from one table.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10"
              onClick={handleResetDefaults}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Defaults
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-black text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Matrix'}
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-neutral-900 bg-black shadow-xl shadow-neutral-950/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-white">
            <thead>
              <tr className="border-b border-white/15 bg-neutral-950">
                <th className="sticky left-0 z-10 min-w-60 bg-neutral-950 px-5 py-4 text-sm font-black">Module</th>
                {roles.map((role) => (
                  <th className="min-w-36 px-4 py-4 text-center text-sm font-black" key={role.key}>
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => {
                const Icon = moduleIcons[module.moduleKey] || FileText

                return (
                  <tr className="group border-b border-white/10 transition hover:bg-white/[0.04]" key={module.moduleKey}>
                    <th className="sticky left-0 z-10 border-b border-white/10 bg-black px-5 py-4 text-sm font-black group-hover:bg-neutral-950">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-emerald-300" />
                        <span>{module.moduleName}</span>
                      </div>
                    </th>
                    {roles.map((role) => (
                      <PermissionCell
                        key={`${module.moduleKey}-${role.key}`}
                        moduleKey={module.moduleKey}
                        onChange={handlePermissionChange}
                        roleKey={role.key}
                        value={module.permissions?.[role.key] || ''}
                      />
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </form>
  )
}

export default PermissionMatrix
