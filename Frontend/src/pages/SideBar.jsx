import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Droplets,
  FileText,
  GalleryHorizontalEnd,
  Home,
  Info,
  Landmark,
  LogOut,
  Menu,
  Megaphone,
  ImageUp,
  Phone,
  Settings2,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
} from 'lucide-react'
import Footer from './Footer'
import { getPermissionMatrix } from '../Services/permissionService'
import NotificationList from '../components/NotificationList'

const languageNames = {
  en: 'English',
  mr: 'Marathi',
  hi: 'Hindi',
}

const navItems = [
  { icon: Home, label: 'Home', moduleKey: 'home', path: '/' },
  { icon: Info, label: 'Panchayat Info', moduleKey: 'panchayatInfo', path: '/panchayat-info' },
  { icon: BarChart3, label: 'Village Statistics', moduleKey: 'villageStatistics', path: '/village-statistics' },
  { icon: Users, label: 'Citizen Services', moduleKey: 'citizenServices', path: '/citizen-services' },
  { icon: Bot, label: 'User AI', moduleKey: 'userAI', path: '/user-ai' },
  { icon: FileText, label: 'Birth Death Registration', moduleKey: 'birthDeathRegistration', path: '/birth-death-registration' },
  { icon: Landmark, label: 'Property Tax', moduleKey: 'propertyTax', path: '/property-tax' },
  { icon: Droplets, label: 'Water Supply', moduleKey: 'waterSupply', path: '/water-supply' },
  { icon: Megaphone, label: 'Complaints', moduleKey: 'complaints', path: '/complaints' },
  { icon: ShieldCheck, label: 'Schemes', moduleKey: 'schemes', path: '/schemes' },
  { icon: BriefcaseBusiness, label: 'Ongoing Projects', moduleKey: 'ongoingProjects', path: '/ongoing-projects' },
  { icon: BriefcaseBusiness, label: 'All Ongoing Projects', moduleKey: 'ongoingProjects', path: '/get-allongoingprojects' },
  { icon: ImageUp, label: 'Media Upload', moduleKey: 'mediaUpload', path: '/media-upload' },
  { icon: GalleryHorizontalEnd, label: 'Gallery', moduleKey: 'gallery', path: '/gallery' },
  { icon: Bell, label: 'Notice Board', moduleKey: 'noticeBoard', path: '/notice-board' },
  { icon: AlertTriangle, label: 'View Emergency Alerts', moduleKey: 'roleManagement', path: '/view-emergency-alerts' },
  { icon: AlertTriangle, label: 'Add Official Emergency Contact', moduleKey: 'roleManagement', path: '/add-official-emergency-contact' },
  { icon: Phone, label: 'Contact', moduleKey: 'contact', path: '/contact' },
  { icon: AlertTriangle, label: 'Emergency Contact', moduleKey: 'emergencyContact', path: '/emergency-contact' },
  { icon: Settings2, label: 'Role Management', moduleKey: 'roleManagement', path: '/role-management' },
  { icon: ShieldCheck, label: 'Permission Matrix', moduleKey: 'roleManagement', path: '/permission-matrix' },
]

const publicNavItems = navItems.filter(
  (item) =>
    item.path === '/' ||
    item.path === '/gallery' ||
    item.path === '/schemes' ||
    item.path === '/notice-board' ||
    item.path === '/user-ai' ||
    item.path === '/get-allongoingprojects' ||
    item.path === '/emergency-contact'
)

function getTokenRole() {
  const token = localStorage.getItem('accesstoken')

  if (!token) {
    return 'citizen'
  }

  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    return decodedPayload?.role || 'citizen'
  } catch {
    return 'citizen'
  }
}

function resolvePermissionRole(role) {
  const roleMap = {
    ApplicationAdmin: 'admin',
    Clerk: 'dataEntry',
    DeputySarpanch: 'deputySarpanch',
    GramSevak: 'gramsevak',
    Operator: 'dataEntry',
    TaxOfficer: 'dataEntry',
    UpSarpanch: 'deputySarpanch',
    WardMember: 'gramsevak',
    WaterSupplyWorker: 'dataEntry',
    sarpanch: 'sarpanch',
  }

  return roleMap[role] || 'citizen'
}

function LogoBlock({ compact = false }) {
  return (
    <div className="flex items-center gap-3" data-no-translate="true">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white shadow-inner ring-4 ring-white/20">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-300 via-green-600 to-emerald-900 text-xs font-black text-white">
          GP
        </div>
      </div>
      {!compact && (
        <div className="leading-tight text-white">
          <p className="text-lg font-black">Chapalgaon</p>
          <p className="text-sm font-bold">Gram Panchayat</p>
        </div>
      )}
    </div>
  )
}

function SideBar() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [visibleNavItems, setVisibleNavItems] = useState(publicNavItems)

  const isLoginPage = location.pathname.startsWith('/login')
  const isHomePage = location.pathname === '/' || location.pathname === '/home'
  const isLoggedIn = Boolean(localStorage.getItem('accesstoken'))
  const title = isLoginPage ? 'Login Portal' : 'Chapalgaon Gram Panchayat'

  useEffect(() => {
    let ignoreResult = false

    async function loadVisibleNavItems() {
      const permissionRole = resolvePermissionRole(getTokenRole())

      if (!isLoggedIn) {
        setVisibleNavItems(publicNavItems)
        return
      }

      if (permissionRole === 'admin') {
        setVisibleNavItems(navItems)
        return
      }

      const result = await getPermissionMatrix()

      if (!result.success || !Array.isArray(result.data?.modules)) {
        if (!ignoreResult && permissionRole !== 'admin') {
          setVisibleNavItems(publicNavItems)
        }
        return
      }

      const permissionsByModule = new Map(
        result.data.modules.map((module) => [module.moduleKey, module.permissions?.[permissionRole] || ''])
      )

      const nextItems = navItems.filter((item) => {
        const permission = permissionsByModule.get(item.moduleKey)

        return permission && permission !== 'Denied'
      })

      if (!ignoreResult) {
        setVisibleNavItems(nextItems.length > 0 ? nextItems : publicNavItems)
      }
    }

    loadVisibleNavItems()

    return () => {
      ignoreResult = true
    }
  }, [isLoggedIn])

  function handleLogout() {
    localStorage.removeItem('accesstoken')
    setLogoutDialogOpen(false)
    navigate('/login/admin', { replace: true })
  }

  const sidebar = (
    <aside className="flex h-screen w-80 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-white">
      <div className="bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-700 px-7 py-7">
        <LogoBlock />
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              className={({ isActive }) =>
                `flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left text-[15px] font-bold transition ${isActive
                  ? 'bg-green-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100'
                  : 'text-neutral-800 hover:bg-neutral-50'
                }`
              }
              end={item.path === '/'}
              key={item.path}
              onClick={() => setMobileOpen(false)}
              to={item.path}
            >
              <Icon className="h-5 w-5 shrink-0 text-emerald-900" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="text-xl font-normal text-neutral-400">&gt;</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#eef3ef] text-neutral-950">
      <div className="h-dvh w-full overflow-hidden bg-white">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full" onClick={(event) => event.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        )}

        <main className="h-dvh min-w-0 overflow-hidden bg-[#f7faf8] lg:pl-80">
          <header className="fixed left-0 right-0 top-0 z-30 flex h-24 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-md shadow-neutral-900/5 sm:px-8 lg:left-80">
            <div className="flex min-w-0 items-center gap-5">
              <button
                className="grid h-11 w-11 place-items-center rounded-lg text-neutral-900 hover:bg-neutral-100"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <Menu size={28} />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black text-emerald-950 sm:text-3xl">{title}</h1>
                <p className="mt-1 hidden items-center gap-3 text-sm font-bold text-emerald-800 sm:flex">
                  <span className="text-xl text-orange-500">Flag</span>
                  Clean village, beautiful village, prosperous village
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <select
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-bold text-emerald-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
                data-no-translate="true"
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                value={i18n.language}
              >
                <option value="mr">{languageNames.mr}</option>
                <option value="hi">{languageNames.hi}</option>
                <option value="en">{languageNames.en}</option>
              </select>

              <div className="relative">
                <button 
                  className="relative hidden text-2xl text-neutral-900 transition hover:text-emerald-700 sm:block" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  type="button"
                >
                  <Bell size={24} />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-xs font-black text-white shadow-sm">
                    3
                  </span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-4 w-80 sm:w-96 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl z-50 origin-top-right">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-3">
                      <h3 className="text-base font-black text-emerald-950">Notifications</h3>
                      <button 
                        className="text-xs font-bold text-emerald-600 transition hover:text-emerald-800"
                        onClick={() => setIsNotificationOpen(false)}
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                    <NotificationList onNotificationClick={() => {
                      setIsNotificationOpen(false);
                    }} />
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <>
                  <Link
                    className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-emerald-800 hover:text-white"
                    title="Profile"
                    to="/profile"
                  >
                    <User size={22} />
                  </Link>
                  <button
                    className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-700 ring-1 ring-red-100 transition hover:bg-red-600 hover:text-white"
                    onClick={() => setLogoutDialogOpen(true)}
                    title="Logout"
                    type="button"
                  >
                    <LogOut size={22} />
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <Link
                  className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900"
                  to="/login/admin"
                >
                  Login
                </Link>
              )}
            </div>
          </header>

          {logoutDialogOpen && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
              <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-black text-neutral-950">Logout</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-600">
                  Are you sure you want to logout?
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    className="h-11 rounded-lg border border-neutral-200 bg-white px-5 text-sm font-black text-neutral-800 transition hover:bg-neutral-50"
                    onClick={() => setLogoutDialogOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-11 rounded-lg bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="fixed inset-x-0 bottom-0 top-24 flex flex-col overflow-y-auto p-4 pb-28 sm:p-8 lg:left-80 lg:pb-8">
            <section
              className={
                isLoginPage
                  ? 'min-h-[calc(100vh-10rem)] text-left'
                  : isHomePage
                    ? 'rounded-none border-0 bg-transparent p-0 text-left shadow-none'
                    : 'rounded-2xl border border-neutral-200 bg-white p-8 text-left shadow-md shadow-neutral-900/5'
              }
            >
              <Outlet />
            </section>

            <div className="mt-auto">
              <Footer />
            </div>
          </div>

          <section className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
            <div className="flex items-center gap-3 overflow-x-auto rounded-3xl bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-800 p-3 text-white shadow-2xl shadow-emerald-950/30">
              <LogoBlock compact />
              {visibleNavItems.slice(0, 8).map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    className={({ isActive }) =>
                      `grid min-w-20 place-items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${isActive ? 'bg-white text-emerald-900 shadow-lg' : 'text-white/95 hover:bg-white/10'
                      }`
                    }
                    end={item.path === '/'}
                    key={item.path}
                    to={item.path}
                  >
                    <Icon size={22} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
              <div className="ml-auto hidden h-12 w-48 items-center rounded-lg bg-white px-4 text-neutral-400 md:flex">
                Search...
                <span className="ml-auto text-xl">⌕</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SideBar
