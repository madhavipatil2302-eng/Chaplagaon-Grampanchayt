import {
  ArrowRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  HomeIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getAllRoleManagements,
  getPublicMediaUploads,
  getPublicPanchayatInfo,
  getPublicVillageStatistics,
  resolveAssetUrl,
} from '../Services/homeservices'
import { getPublicNotices } from '../Services/noticeBoardService'

const defaultStats = [
  {
    titleKey: 'statsPopulationTitle',
    value: '5,245',
    changeKey: 'statsPopulationChange',
    icon: Users,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    titleKey: 'statsFamiliesTitle',
    value: '1,125',
    changeKey: 'statsFamiliesChange',
    icon: HomeIcon,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
  },
  {
    titleKey: 'statsTaxTitle',
    value: 'Rs. 2,45,320',
    changeKey: 'statsTaxChange',
    icon: CircleDollarSign,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
]

const notices = [
  {
    categoryKey: 'noticeImportantCategory',
    titleKey: 'noticeCitizenTitle',
    descriptionKey: 'noticeCitizenDescription',
    date: '12 July 2026',
    important: true,
  },
  {
    categoryKey: 'noticeGramSabhaCategory',
    titleKey: 'noticeGramSabhaTitle',
    descriptionKey: 'noticeGramSabhaDescription',
    date: '18 July 2026',
  },
  {
    categoryKey: 'noticeWaterSupplyCategory',
    titleKey: 'noticeWaterSupplyTitle',
    descriptionKey: 'noticeWaterSupplyDescription',
    date: '20 July 2026',
  },
]

function formatNumber(value, fallback) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return fallback
  }

  return new Intl.NumberFormat('en-IN').format(numberValue)
}

function buildMapQuery(panchayatInfo) {
  if (panchayatInfo?.latitude && panchayatInfo?.longitude) {
    return `${panchayatInfo.latitude},${panchayatInfo.longitude}`
  }

  return [
    panchayatInfo?.villageName,
    panchayatInfo?.taluka,
    panchayatInfo?.district,
    panchayatInfo?.state,
  ]
    .filter(Boolean)
    .join(' ') || 'Chapalgaon Akkalkot Maharashtra'
}

function isImageMedia(item) {
  return item?.mediaMimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(item?.mediaFile || '')
}

function ChapalgaonMap({ panchayatInfo }) {
  const mapQuery = buildMapQuery(panchayatInfo)
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(panchayatInfo?.googleMapLink || mapQuery)}&output=embed`
  const mapOpenUrl = panchayatInfo?.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const villageTitle = panchayatInfo?.villageName || 'Chapalgaon'
  const talukaTitle = panchayatInfo?.taluka || 'Akkalkot'

  return (
    <section className="mx-auto mt-10 max-w-7xl px-5">
      <div className="grid overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-lg shadow-slate-900/5 lg:grid-cols-[1.05fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
            <MapPin size={17} />
            Location Map
          </div>
          <h2 className="text-2xl font-black text-emerald-950 sm:text-3xl">{villageTitle}, {talukaTitle} Taluka</h2>

          <div className="mt-5 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">State</p>
              <p className="mt-1 text-emerald-950">{panchayatInfo?.state || 'Maharashtra'}</p>
            </div>
            <div className="rounded-lg bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-sky-700">District</p>
              <p className="mt-1 text-sky-950">{panchayatInfo?.district || 'Solapur'}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-amber-700">Taluka</p>
              <p className="mt-1 text-amber-950">{talukaTitle}</p>
            </div>
          </div>
        </div>

        <a
          aria-label={`Open ${villageTitle} ${talukaTitle} location in Google Maps`}
          className="group relative block min-h-[320px] overflow-hidden bg-slate-100"
          href={mapOpenUrl}
          rel="noreferrer"
          target="_blank"
        >
          <iframe
            className="pointer-events-none absolute inset-0 h-full w-full border-0 transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title="Chapalgaon Akkalkot Maharashtra map"
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:inset-x-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-700 text-white">
                <MapPin size={21} />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-950">{villageTitle}, {talukaTitle}</p>
                <p className="text-xs font-bold text-slate-500">Click kara ani Google Maps madhe location open hoil</p>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}

function Home() {
  const { t } = useTranslation()
  const [roleMembers, setRoleMembers] = useState([])
  const [roleLoading, setRoleLoading] = useState(true)
  const [expandedRoleId, setExpandedRoleId] = useState('')
  const [galleryItems, setGalleryItems] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [publicNotices, setPublicNotices] = useState([])
  const [noticeLoading, setNoticeLoading] = useState(true)
  const [panchayatInfo, setPanchayatInfo] = useState(null)
  const [villageStatistics, setVillageStatistics] = useState(null)
  const selectedRoleMember = roleMembers.find((member) => (member._id || member.email || member.fullName) === expandedRoleId)
  const heroImage = panchayatInfo?.panchayatImage ? resolveAssetUrl(panchayatInfo.panchayatImage) : ''
  const heroVillageName = panchayatInfo?.gramPanchayatName || panchayatInfo?.villageName
  const homeStats = defaultStats.map((stat) => {
    if (stat.titleKey === 'statsPopulationTitle') {
      return {
        ...stat,
        value: formatNumber(villageStatistics?.totalPopulation, stat.value),
      }
    }

    if (stat.titleKey === 'statsFamiliesTitle') {
      return {
        ...stat,
        value: formatNumber(villageStatistics?.totalHouseholds, stat.value),
      }
    }

    return stat
  })

  useEffect(() => {
    let ignoreResult = false

    async function loadRoleMembers() {
      const result = await getAllRoleManagements()

      if (!ignoreResult) {
        setRoleMembers(result.data)
        setRoleLoading(false)
      }
    }

    loadRoleMembers()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadVillageStatistics() {
      const result = await getPublicVillageStatistics()

      if (!ignoreResult && result.success && result.data) {
        setVillageStatistics(result.data)
      }
    }

    loadVillageStatistics()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadGalleryItems() {
      const result = await getPublicMediaUploads()

      if (!ignoreResult) {
        setGalleryItems(Array.isArray(result.data) ? result.data : [])
        setGalleryLoading(false)
      }
    }

    loadGalleryItems()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadNotices() {
      const result = await getPublicNotices()

      if (!ignoreResult) {
        setPublicNotices(result.success && Array.isArray(result.data) ? result.data : [])
        setNoticeLoading(false)
      }
    }

    loadNotices()

    return () => {
      ignoreResult = true
    }
  }, [])

  useEffect(() => {
    let ignoreResult = false

    async function loadPanchayatInfo() {
      const result = await getPublicPanchayatInfo()

      if (!ignoreResult && result.success && result.data) {
        setPanchayatInfo(result.data)
      }
    }

    loadPanchayatInfo()

    return () => {
      ignoreResult = true
    }
  }, [])

  return (
    <div className="overflow-hidden bg-[#fafafb] text-slate-950 font-sans">
      {/* Hero Section */}
      <section className="relative bg-[#0b3026] px-5 py-24 text-white sm:px-8 lg:px-20 lg:pt-32 lg:pb-48 overflow-hidden">
        {heroImage && (
          <img
            alt={heroVillageName || 'Gram Panchayat'}
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={heroImage}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,48,38,0.8)_0%,rgba(11,48,38,0.7)_52%,rgba(11,48,38,0.5)_100%)]" />
        <div className="relative mx-auto max-w-7xl z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-[#164039] px-4 py-1.5 text-xs font-bold text-emerald-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-amber-400"></div>
            Official Government Portal
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[64px] max-w-3xl mb-6">
            Welcome to<br />
            {heroVillageName || 'Chapalgaon'} Gram<br />
            Panchayat
          </h1>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-emerald-100/80 sm:text-lg">
            A meaningful step toward digital services, transparent governance, and sustainable village development. Dedicated to serving our community.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 rounded bg-[#0d7a5b] px-6 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-[#0b664c]">
              Citizen Services
              <ArrowRight size={18} />
            </button>
            <button className="flex items-center gap-2 rounded border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Village Highlights
              <FileText size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section (Overlapping Hero) */}
      <section className="relative z-20 mx-auto -mt-24 max-w-7xl px-5 lg:-mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          {/* Stat 1 */}
          <article className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Population</p>
              <h3 className="mt-1 text-3xl font-black text-slate-900">{formatNumber(villageStatistics?.totalPopulation, '5,245')}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                +2.4% vs last year
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Users size={24} />
            </div>
          </article>
          
          {/* Stat 2 */}
          <article className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Families</p>
              <h3 className="mt-1 text-3xl font-black text-slate-900">{formatNumber(villageStatistics?.totalHouseholds, '1,125')}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                +1.1% vs last year
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600">
              <HomeIcon size={24} />
            </div>
          </article>

          {/* Stat 3 */}
          <article className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax Collected</p>
              <h3 className="mt-1 text-3xl font-black text-slate-900">₹ 2,45,320</h3>
              <p className="mt-1 text-xs font-bold text-slate-400">Current Financial Year</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600">
              <CircleDollarSign size={24} />
            </div>
          </article>
        </div>
      </section>

      {/* Main Content Grid (Map + Notice Board) */}
      <section className="mx-auto mt-16 max-w-7xl px-5">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Left: Location Map */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <MapPin size={24} className="text-[#0b3026]" />
              <h2 className="font-serif text-2xl font-bold text-[#0b3026]">Location Map</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#e8dcb9] bg-[#fbfaf6] p-3 shadow-sm">
               <div className="relative h-[400px] w-full flex flex-col justify-center overflow-hidden rounded border border-[#e8dcb9]">
                  <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(panchayatInfo?.googleMapLink || [panchayatInfo?.villageName, panchayatInfo?.taluka, panchayatInfo?.district, panchayatInfo?.state].filter(Boolean).join(' ') || 'Chapalgaon Akkalkot Maharashtra')}&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" />
               </div>
            </div>
          </div>

          {/* Right: Notice Board */}
          <div className="flex flex-col">
            <div className="mb-5 flex items-center gap-2">
              <Bell size={24} className="text-amber-500 fill-amber-500" />
              <h2 className="font-serif text-2xl font-bold text-[#0b3026]">Notice Board</h2>
            </div>
            
            <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex-1 space-y-5">
                {noticeLoading ? (
                  <div className="text-sm font-bold text-slate-600">Loading notices...</div>
                ) : (publicNotices.length > 0 ? publicNotices : notices).slice(0, 2).map((notice, idx) => (
                  <div key={notice._id || notice.titleKey || idx} className="border-b border-slate-100 pb-5">
                     <div className="mb-3 flex items-center justify-between">
                       <span className={`rounded px-2.5 py-1 text-[11px] font-bold ${notice.noticeType === 'Urgent' || notice.noticeType === 'Important' || notice.important ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                         {notice.category || notice.noticeType || (notice.categoryKey ? t(notice.categoryKey) : 'Notice')}
                       </span>
                       <span className="text-xs font-medium text-slate-400">
                         {notice.createdAt ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(notice.createdAt)) : notice.date}
                       </span>
                     </div>
                     <h3 className="mb-2 text-sm font-bold text-slate-900">{notice.title || (notice.titleKey ? t(notice.titleKey) : 'Untitled')}</h3>
                     <p className="text-sm leading-relaxed text-slate-500 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">{notice.description || (notice.descriptionKey ? t(notice.descriptionKey) : '')}</p>
                  </div>
                ))}
              </div>
              <a href="/notice-board" className="mt-5 block w-full rounded border border-slate-200 py-2.5 text-center text-sm font-bold text-[#0b3026] hover:bg-slate-50">
                View All Notices
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Grid 2 (Gallery + Sadasya) */}
      <section className="mx-auto mt-16 mb-24 max-w-7xl px-5">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          
          {/* Left: Village Gallery */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-[#0b3026]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="font-serif text-2xl font-bold text-[#0b3026]">Village Gallery</h2>
              </div>
              <a href="/gallery" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900">
                View All <ArrowRight size={14} />
              </a>
            </div>
            
            {galleryLoading ? (
              <div className="text-sm font-bold text-slate-600">Loading gallery...</div>
            ) : galleryItems.length === 0 ? (
              <div className="text-sm font-bold text-slate-600">No gallery media found.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {galleryItems.slice(0, 2).map((item) => {
                  const mediaUrl = resolveAssetUrl(item.mediaFile)
                  const isImage = isImageMedia(item)
                  return (
                    <div key={item._id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-200">
                      {isImage && mediaUrl ? (
                        <img src={mediaUrl} alt={item.title || item.mediaFileName || 'Gallery image'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full place-items-center bg-slate-200"><FileText className="h-12 w-12 text-slate-400" /></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4"><h3 className="text-sm font-bold text-white">{item.title || item.mediaFileName || 'Untitled media'}</h3></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Grampanchayat Sadasya */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Users size={24} className="text-[#0b3026]" />
              <h2 className="font-serif text-2xl font-bold text-[#0b3026]">Grampanchayat Sadasya</h2>
            </div>
            
            {roleLoading ? (
              <div className="text-sm font-bold text-slate-600">Loading members...</div>
            ) : roleMembers.length === 0 ? (
              <div className="text-sm font-bold text-slate-600">No role members found.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {roleMembers.slice(0, 2).map((member) => {
                  const memberId = member._id || member.email || member.fullName
                  const memberPhoto = resolveAssetUrl(member.profilePhoto)
                  return (
                    <div key={memberId} className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                      <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100 shadow-sm grid place-items-center">
                        {memberPhoto ? (
                          <img src={memberPhoto} alt={member.fullName || member.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-10 w-10 text-slate-400" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{member.fullName || member.name || 'Name not available'}</h3>
                      <p className="mb-4 text-xs font-bold text-emerald-700">{member.role || member.responsibilities || 'Role not available'}</p>
                      <button 
                        onClick={() => setExpandedRoleId(memberId)}
                        className="mt-auto w-full rounded border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                        Read More
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </section>

      {selectedRoleMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-6" onClick={() => setExpandedRoleId('')}>
          <article
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b3b75]">Member Details</p>
                <h3 className="mt-1 text-xl font-black text-[#0b3b75]">
                  {selectedRoleMember.fullName || selectedRoleMember.name || 'Name not available'}
                </h3>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-md text-neutral-700 hover:bg-neutral-100"
                onClick={() => setExpandedRoleId('')}
                type="button"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[9rem_1fr]">
              <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full border border-[#0b3b75] bg-slate-50 p-1">
                {selectedRoleMember.profilePhoto ? (
                  <img
                    alt={selectedRoleMember.fullName || selectedRoleMember.name || 'Team member'}
                    className="h-full w-full rounded-full object-cover"
                    src={resolveAssetUrl(selectedRoleMember.profilePhoto)}
                  />
                ) : (
                  <Users className="h-11 w-11 text-slate-400" />
                )}
              </div>

              <div className="space-y-4 text-sm font-semibold leading-6 text-neutral-700">
                <p className="text-base font-black text-neutral-950">{selectedRoleMember.role || 'Role not available'}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                    <span className="min-w-0 break-words">{selectedRoleMember.email || 'Email not available'}</span>
                  </p>
                  <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                    <Phone className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                    <span>{selectedRoleMember.mobileNumber || 'Contact not available'}</span>
                  </p>
                </div>
                <p className="flex gap-2 rounded-md bg-neutral-50 p-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#0b3b75]" />
                  <span>
                    {selectedRoleMember.villageName
                      ? `${selectedRoleMember.villageName}${selectedRoleMember.wardNumber ? `, Ward ${selectedRoleMember.wardNumber}` : ''}`
                      : 'Location not set'}
                  </span>
                </p>
                <p>
                  <span className="font-black text-[#0b3b75]">Assigned Work: </span>
                  {selectedRoleMember.responsibilities || 'Not assigned yet.'}
                </p>
                {selectedRoleMember.bio && (
                  <p>
                    <span className="font-black text-[#0b3b75]">Bio: </span>
                    {selectedRoleMember.bio}
                  </p>
                )}
                {Array.isArray(selectedRoleMember.priorityProjects) && selectedRoleMember.priorityProjects.length > 0 && (
                  <div>
                    <p className="font-black text-[#0b3b75]">Priority Projects</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRoleMember.priorityProjects.map((project) => (
                        <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700" key={project}>
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export default Home
