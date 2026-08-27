import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, CheckCircle2, Download, FileText, FileUp, Filter, Pin, Send, X, XCircle } from 'lucide-react'

import Toast from '../components/Toast'
import {
  approveNotice,
  createNotice,
  getAdminNotices,
  getPublicNotices,
  resolveNoticeAssetUrl,
  rejectNotice,
} from '../Services/noticeBoardService'

const emptyNotice = {
  title: '',
  description: '',
  category: '',
  noticeType: 'Information',
  expiryDate: '',
  isPinned: false,
  attachment: null,
}

const creatorRoles = ['ApplicationAdmin', 'GramSevak']
const approverRoles = ['sarpanch', 'UpSarpanch', 'DeputySarpanch']

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

function statusClass(status) {
  if (status === 'Approved') {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (status === 'Rejected') {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-amber-100 text-amber-800'
}

function isImageAttachment(path = '') {
  return /\.(png|jpe?g|gif|webp)$/i.test(path)
}

function NoticeDialog({ notice, onClose }) {
  if (!notice) {
    return null
  }

  const attachmentUrl = resolveNoticeAssetUrl(notice.attachment)
  const hasImageAttachment = isImageAttachment(notice.attachment)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6" onClick={onClose}>
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-emerald-800">{notice.category || notice.noticeType || 'Notice'}</p>
            <h3 className="mt-1 truncate text-2xl font-black text-slate-950">{notice.title || 'Untitled notice'}</h3>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={onClose} title="Close" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="bg-slate-100">
            <div className="grid min-h-72 place-items-center text-emerald-900">
              {attachmentUrl && hasImageAttachment ? (
                <img alt={notice.title || 'Notice attachment'} className="h-full min-h-72 w-full object-cover" src={attachmentUrl} />
              ) : notice.isPinned ? (
                <Pin className="h-16 w-16" />
              ) : (
                <Bell className="h-16 w-16" />
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full px-4 py-2 text-xs font-black ${statusClass(notice.approvalStatus)}`}>
                {notice.approvalStatus || 'Pending'}
              </span>
              <p className="text-sm font-black text-emerald-950">{notice.noticeType || 'Information'}</p>
            </div>

            <p className="mt-5 text-sm font-semibold leading-7 text-slate-600">{notice.description || 'No description available.'}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Category</p>
                <p className="mt-2 text-sm font-black text-slate-900">{notice.category || 'General'}</p>
              </div>
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Created</p>
                <p className="mt-2 text-sm font-black text-slate-900">{formatDate(notice.createdAt)}</p>
              </div>
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Expiry</p>
                <p className="mt-2 text-sm font-black text-slate-900">{formatDate(notice.expiryDate)}</p>
              </div>
              <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">Pinned</p>
                <p className="mt-2 text-sm font-black text-slate-900">{notice.isPinned ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {attachmentUrl && (
              <a
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-black text-white hover:bg-emerald-900"
                href={attachmentUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                Open Attachment
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function NoticeBoard() {
  const [notices, setNotices] = useState([])
  const [formData, setFormData] = useState(emptyNotice)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const role = getTokenRole()
  const canCreate = creatorRoles.includes(role)
  const canApprove = approverRoles.includes(role)
  const isLoggedIn = Boolean(role)

  const pendingNotices = useMemo(() => notices.filter((notice) => notice.approvalStatus === 'Pending'), [notices])
  const visibleNotices = useMemo(() => {
    const baseNotices = isLoggedIn
      ? notices
      : notices.filter((notice) => notice.approvalStatus === 'Approved')

    if (statusFilter === 'all') {
      return baseNotices
    }

    return baseNotices.filter((notice) => notice.approvalStatus === statusFilter)
  }, [isLoggedIn, notices, statusFilter])

  useEffect(() => {
    loadNotices()
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  async function loadNotices() {
    const result = isLoggedIn ? await getAdminNotices() : await getPublicNotices()

    if (result.success && Array.isArray(result.data)) {
      setNotices(result.data)
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setLoading(false)
  }

  function handleChange(event) {
    const { checked, files, name, type, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = await createNotice(formData)

    if (result.success && result.data) {
      setNotices((currentNotices) => [result.data, ...currentNotices])
      setFormData(emptyNotice)
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  async function handleApprove(event, noticeId) {
    event.stopPropagation()
    const result = await approveNotice(noticeId)

    if (result.success && result.data) {
      setNotices((currentNotices) =>
        currentNotices.map((notice) => (notice._id === noticeId ? { ...notice, ...result.data } : notice))
      )
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }
  }

  async function handleReject(event, noticeId) {
    event.stopPropagation()
    const result = await rejectNotice(noticeId, 'Rejected by approver')

    if (result.success && result.data) {
      setNotices((currentNotices) =>
        currentNotices.map((notice) => (notice._id === noticeId ? { ...notice, ...result.data } : notice))
      )
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }
  }

  function handleNoticeKeyDown(event, notice) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedNotice(notice)
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#f4faf8] px-4 py-6 text-slate-950 sm:-m-8 sm:px-8 sm:py-8">
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />
      <NoticeDialog notice={selectedNotice} onClose={() => setSelectedNotice(null)} />

      <section className="rounded-lg bg-[#eaf5f3] p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black text-emerald-900">Gram Panchayat Updates</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Notice Board</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              View notices published after approval. Click any notice to see full information.
            </p>
          </div>

          <label className="inline-flex h-12 w-full max-w-56 items-center gap-2 rounded-lg bg-emerald-950 px-4 text-sm font-black text-white md:w-auto">
            <Filter className="h-4 w-4" />
            <select className="min-w-0 flex-1 bg-transparent text-white outline-none" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option className="text-slate-900" value="all">Filter</option>
              {isLoggedIn && <option className="text-slate-900" value="Pending">Pending</option>}
              <option className="text-slate-900" value="Approved">Approved</option>
              {isLoggedIn && <option className="text-slate-900" value="Rejected">Rejected</option>}
            </select>
          </label>
        </div>
      </section>

      {canCreate && (
        <form className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100" onSubmit={handleSubmit}>
          <h3 className="text-xl font-black text-slate-950">Add Notice</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="title" onChange={handleChange} placeholder="Notice title" required value={formData.title} />
            <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="category" onChange={handleChange} placeholder="Category" value={formData.category} />
            <select className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="noticeType" onChange={handleChange} value={formData.noticeType}>
              <option value="Information">Information</option>
              <option value="Important">Important</option>
              <option value="Urgent">Urgent</option>
              <option value="Meeting">Meeting</option>
            </select>
            <input className="h-12 rounded-lg border border-slate-200 px-4 text-sm font-bold outline-none focus:border-emerald-700" name="expiryDate" onChange={handleChange} type="date" value={formData.expiryDate} />
            <textarea className="min-h-28 rounded-lg border border-slate-200 p-4 text-sm font-bold outline-none focus:border-emerald-700 md:col-span-2" name="description" onChange={handleChange} placeholder="Notice description" required value={formData.description} />
            <label className="block md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <FileUp className="h-4 w-4 text-emerald-800" />
                Upload Attachment
              </span>
              <input
                accept="image/*,.pdf,.doc,.docx"
                className="h-12 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold outline-none focus:border-emerald-700"
                name="attachment"
                onChange={handleChange}
                type="file"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
              <input checked={formData.isPinned} name="isPinned" onChange={handleChange} type="checkbox" />
              Pin this notice
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-950 px-5 text-sm font-black text-white hover:bg-emerald-900 disabled:opacity-60" disabled={saving} type="submit">
              <Send className="h-4 w-4" />
              {saving ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      )}

      {canApprove && pendingNotices.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-lg font-black text-amber-900">Pending Approval</h3>
          <p className="mt-1 text-sm font-semibold text-amber-800">{pendingNotices.length} notices waiting for approval.</p>
        </section>
      )}

      {loading ? (
        <div className="mt-6 rounded-lg border border-slate-100 bg-white p-8 text-sm font-bold text-slate-600 shadow-sm">Loading notices...</div>
      ) : visibleNotices.length === 0 ? (
        <div className="mt-6 grid min-h-44 place-items-center rounded-lg border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-emerald-800">
              <FileText className="h-7 w-7" />
            </div>
            <p className="mt-4 text-base font-black text-slate-800">No notices available.</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">Approved notices will appear here for citizens.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleNotices.map((notice) => {
            const attachmentUrl = resolveNoticeAssetUrl(notice.attachment)
            const hasImageAttachment = isImageAttachment(notice.attachment)

            return (
              <article
                className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100"
                key={notice._id}
                onClick={() => setSelectedNotice(notice)}
                onKeyDown={(event) => handleNoticeKeyDown(event, notice)}
                role="button"
                tabIndex={0}
              >
                <div className="relative">
                  <div className="grid aspect-[16/9] max-h-56 w-full place-items-center overflow-hidden bg-[#dfeaf4] text-emerald-900">
                    {attachmentUrl && hasImageAttachment ? (
                      <img alt={notice.title || 'Notice attachment'} className="h-full w-full object-cover" src={attachmentUrl} />
                    ) : notice.isPinned ? (
                      <Pin className="h-12 w-12" />
                    ) : (
                      <Bell className="h-12 w-12" />
                    )}
                  </div>
                  <span className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-black shadow-sm ${statusClass(notice.approvalStatus)}`}>
                    {notice.approvalStatus || 'Pending'}
                  </span>
                </div>

                <div className="flex min-h-48 flex-1 flex-col bg-white p-5">
                  <p className="text-xs font-black text-emerald-800">{notice.category || notice.noticeType || 'Notice'}</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">{notice.title || 'Untitled notice'}</h3>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                    {notice.description || 'No description available.'}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(notice.createdAt)}
                  </p>
                  <p className="mt-auto pt-5 text-xs font-black uppercase text-emerald-800">Click to view details</p>

                  {canApprove && notice.approvalStatus === 'Pending' && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-black text-white hover:bg-emerald-800" onClick={(event) => handleApprove(event, notice._id)} type="button">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-50 px-4 text-xs font-black text-red-700 ring-1 ring-red-200 hover:bg-red-100" onClick={(event) => handleReject(event, notice._id)} type="button">
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NoticeBoard
