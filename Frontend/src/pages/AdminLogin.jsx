import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import { adminLogin, verifyAdminEmail } from '../Services/loginservices'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    if (localStorage.getItem('accesstoken')) {
      navigate('/role-management', { replace: true })
    }
  }, [navigate])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  async function handleEmailVerify(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    setPassword('')
    setEmailVerified(false)

    const result = await verifyAdminEmail(email.trim())

    if (result.success) {
      setEmailVerified(true)
      setMessage('Email verified. Please enter password.')
      showToast({ message: 'Email verified. Please enter password.', type: 'success' })
    } else {
      setError(result.message)
      showToast({ message: result.message, type: 'error' })
    }

    setLoading(false)
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const result = await adminLogin(email.trim(), password)

    if (result.success) {
      setMessage('Admin login successful.')
      showToast({ message: 'Login successful.', type: 'success' })
      window.setTimeout(() => {
        navigate('/role-management', {
          replace: true,
          state: { toast: 'Login successful.' },
        })
      }, 700)
    } else {
      setError(result.message)
      showToast({ message: result.message, type: 'error' })
    }

    setLoading(false)
  }

  function handleEmailChange(event) {
    setEmail(event.target.value)
    setPassword('')
    setEmailVerified(false)
    setMessage('')
    setError('')
  }

  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-[0.95fr_1.05fr] gap-6 rounded-2xl sm:rounded-3xl border border-neutral-200 bg-white p-4 sm:p-8 lg:p-10 xl:p-12 shadow-xl shadow-neutral-900/5 lg:items-center">
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />
      
      {/* Notice Section - Below on mobile, left on desktop */}
      <section className="flex flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6 lg:p-10">
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Important Notice</p>
        <h2 className="mt-2 text-xl sm:text-3xl font-black text-neutral-950">Authenticated Users Only</h2>
        <p className="mt-3 text-xs sm:text-base leading-6 sm:leading-7 text-neutral-700">
          This login page is only for verified Gram Panchayat administrators. Please use your registered admin email.
          Password access will be shown only after your email is verified.
        </p>
        <ul className="mt-4 space-y-2 text-xs sm:text-sm font-semibold text-neutral-700">
          <li>• Do not share your login details with anyone.</li>
          <li>• Use only your official registered email address.</li>
          <li>• Contact the office if your email verification fails.</li>
        </ul>
      </section>

      {/* Login Form Section - FIRST on mobile, right on desktop */}
      <section className="flex w-full flex-col justify-center">
        <div className="mb-4 sm:mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
            Secure Access
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-neutral-950">Admin Login</h2>
          <p className="mt-1 sm:mt-3 text-xs sm:text-base text-neutral-600">
            Verify admin email first. Password field will open only after email is verified.
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={emailVerified ? handleLogin : handleEmailVerify}>
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-700" htmlFor="admin-email">
              Email Address
            </label>
            <input
              className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm sm:text-base font-semibold outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
              data-no-translate="true"
              id="admin-email"
              onChange={handleEmailChange}
              placeholder="admin@example.com"
              type="email"
              value={email}
              required
            />
          </div>

          {emailVerified && (
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-700" htmlFor="admin-password">
                Password
              </label>
              <input
                autoFocus
                className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm sm:text-base font-semibold outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                data-no-translate="true"
                id="admin-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                type="password"
                value={password}
                required
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-700">
              {message}
            </div>
          )}

          <button
            className="h-12 w-full rounded-xl bg-emerald-800 text-sm sm:text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Please wait...' : emailVerified ? 'Login' : 'Verify Email'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AdminLogin
