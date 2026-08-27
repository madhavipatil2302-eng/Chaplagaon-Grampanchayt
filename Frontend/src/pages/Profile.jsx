import { useEffect, useState } from 'react'
import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import Toast from '../components/Toast'
import { getProfile, resolveProfileImage, updateProfile } from '../Services/profileservices'

const emptyProfile = {
  fullName: '',
  name: '',
  email: '',
  mobileNumber: '',
  alternateMobileNumber: '',
  role: '',
  profilePhoto: '',
}

function Profile() {
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile()

      if (result.success && result.data) {
        setProfile({
          ...emptyProfile,
          ...result.data,
        })
      } else {
        showToast({ message: result.message, type: 'error' })
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = await updateProfile({
      email: profile.email,
      mobileNumber: profile.mobileNumber,
      alternateMobileNumber: profile.alternateMobileNumber,
    })

    if (result.success && result.data) {
      setProfile({
        ...emptyProfile,
        ...result.data,
      })
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="rounded-lg bg-white p-6 text-sm font-bold text-neutral-600">Loading profile...</div>
  }

  return (
    <form className="mx-auto max-w-5xl" onSubmit={handleSubmit}>
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />

      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-full border border-emerald-800 bg-emerald-50 p-1">
            {profile.profilePhoto ? (
              <img
                alt={profile.fullName || profile.name || 'Profile'}
                className="h-full w-full rounded-full object-cover"
                src={resolveProfileImage(profile.profilePhoto)}
              />
            ) : (
              <UserRound className="h-14 w-14 text-emerald-800" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">My Profile</p>
            <h2 className="mt-2 text-3xl font-black text-neutral-950">
              {profile.fullName || profile.name || 'Profile'}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              {profile.role || 'Role not available'}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-neutral-950">Edit Contact Details</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <Mail className="h-4 w-4 text-emerald-800" />
              Email
            </span>
            <input
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="email"
              onChange={handleChange}
              type="email"
              value={profile.email}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <Phone className="h-4 w-4 text-emerald-800" />
              Contact Number
            </span>
            <input
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="mobileNumber"
              onChange={handleChange}
              type="tel"
              value={profile.mobileNumber || ''}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <Phone className="h-4 w-4 text-emerald-800" />
              Alternate Contact Number
            </span>
            <input
              className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              name="alternateMobileNumber"
              onChange={handleChange}
              type="tel"
              value={profile.alternateMobileNumber || ''}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="h-12 rounded-lg bg-emerald-800 px-6 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>
    </form>
  )
}

export default Profile
