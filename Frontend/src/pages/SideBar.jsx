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
  X,
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
      <div className="flex items-center justify-between bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-700 px-6 py-6">
        <LogoBlock />
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          title="Close Sidebar"
          type="button"
        >
          <X size={22} />
        </button>
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

  const mobileBottomTabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Bot, label: 'AI Help', path: '/user-ai' },
    { icon: Bell, label: 'Notices', path: '/notice-board' },
    { icon: Megaphone, label: 'Complaints', path: '/complaints' },
    { icon: ShieldCheck, label: 'Schemes', path: '/schemes' },
    { icon: BriefcaseBusiness, label: 'Projects', path: '/get-allongoingprojects' },
    { icon: AlertTriangle, label: 'Emergency', path: '/emergency-contact' },
    isLoggedIn
      ? { icon: User, label: 'Profile', path: '/profile' }
      : { icon: LogOut, label: 'Login', path: '/login/admin' },
  ]

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#eef3ef] text-neutral-950">
      <div className="h-dvh w-full overflow-hidden bg-white">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-[82vw] max-w-[310px] shadow-2xl" onClick={(event) => event.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        )}

        <main className="h-dvh min-w-0 overflow-hidden bg-[#f7faf8] lg:pl-80">
          <header className="fixed left-0 right-0 top-0 z-30 flex h-16 sm:h-24 items-center justify-between border-b border-neutral-200 bg-white px-3 sm:px-8 shadow-md shadow-neutral-900/5 lg:left-80">
            <div className="flex min-w-0 items-center gap-2 sm:gap-5">
              <button
                className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-lg text-neutral-900 hover:bg-neutral-100"
                onClick={() => setMobileOpen(true)}
                type="button"
                aria-label="Open navigation menu"
              >
                <Menu size={24} className="sm:hidden" />
                <Menu size={28} className="hidden sm:block" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-black text-emerald-950 sm:text-2xl lg:text-3xl max-w-[140px] xs:max-w-[200px] sm:max-w-none">{title}</h1>
                <p className="mt-1 hidden items-center gap-3 text-sm font-bold text-emerald-800 sm:flex">
                  <span className="text-xl text-orange-500">Flag</span>
                  Clean village, beautiful village, prosperous village
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <select
                className="h-9 sm:h-11 rounded-xl border border-neutral-200 bg-white px-2 sm:px-3 text-xs sm:text-sm font-bold text-emerald-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
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
                  className="relative grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full text-neutral-900 transition hover:bg-neutral-100 hover:text-emerald-700" 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  title="Notifications"
                  type="button"
                >
                  <Bell size={20} className="sm:hidden" />
                  <Bell size={24} className="hidden sm:block" />
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full bg-red-600 text-[10px] sm:text-xs font-black text-white shadow-sm">
                    3
                  </span>
                </button>

                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:bg-transparent" 
                      onClick={() => setIsNotificationOpen(false)} 
                    />
                    <div className="fixed inset-x-3 top-18 z-50 max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl sm:absolute sm:right-0 sm:top-auto sm:inset-x-auto sm:mt-4 sm:w-96">
                      <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-3">
                        <h3 className="text-base font-black text-emerald-950">Notifications</h3>
                        <button 
                          className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-900"
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
                  </>
                )}
              </div>

              {isLoggedIn && (
                <>
                  <Link
                    className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-emerald-800 hover:text-white"
                    title="Profile"
                    to="/profile"
                  >
                    <User size={18} className="sm:hidden" />
                    <User size={22} className="hidden sm:block" />
                  </Link>
                  <button
                    className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700 ring-1 ring-red-100 transition hover:bg-red-600 hover:text-white"
                    onClick={() => setLogoutDialogOpen(true)}
                    title="Logout"
                    type="button"
                  >
                    <LogOut size={18} className="sm:hidden" />
                    <LogOut size={22} className="hidden sm:block" />
                  </button>
                </>
              )}

              {!isLoggedIn && !isLoginPage && (
                <Link
                  className="rounded-xl bg-emerald-800 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 shrink-0"
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

          <div className="fixed inset-x-0 bottom-0 top-16 sm:top-24 flex flex-col overflow-y-auto p-3 pb-24 sm:p-8 lg:left-80 lg:pb-8">
            <section
              className={
                isLoginPage
                  ? 'min-h-[calc(100vh-10rem)] text-left'
                  : isHomePage
                    ? 'rounded-none border-0 bg-transparent p-0 text-left shadow-none'
                    : 'rounded-2xl border border-neutral-200 bg-white p-4 sm:p-8 text-left shadow-md shadow-neutral-900/5'
              }
            >
              <Outlet />
            </section>

            <div className="mt-auto">
              <Footer />
            </div>
          </div>

          <section className="fixed inset-x-2 bottom-2 z-30 lg:hidden">
            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-gradient-to-r from-emerald-950 via-green-900 to-emerald-950 p-1.5 text-white shadow-2xl shadow-emerald-950/40 ring-1 ring-white/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {mobileBottomTabs.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    className={({ isActive }) =>
                      `flex min-w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${
                        isActive
                          ? 'bg-white text-emerald-950 shadow-md font-black'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`
                    }
                    end={item.path === '/'}
                    key={item.path}
                    to={item.path}
                  >
                    <Icon size={18} />
                    <span className="truncate max-w-[62px]">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default SideBar
