import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Filter,
  HardHat,
  IndianRupee,
  MapPin,
  UserRound,
  X,
} from 'lucide-react'

import { getPublicOngoingProjects, resolveAssetUrl } from '../Services/homeservices'

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

function formatAmount(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount)
}

function getStatusClass(status = '') {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes('complete')) {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (normalizedStatus.includes('planning') || normalizedStatus.includes('upcoming')) {
    return 'bg-cyan-100 text-cyan-800'
  }

  if (normalizedStatus.includes('hold')) {
    return 'bg-amber-100 text-amber-800'
  }

  return 'bg-emerald-800 text-white'
}

function ProjectMeta({ icon: Icon, label, value }) {
  return (
    <div className="min-h-20 rounded-lg bg-[#eef4ff] p-4">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-black text-slate-800">{value || 'Not specified'}</p>
    </div>
  )
}

function ProjectDialog({ onClose, project }) {
  if (!project) {
    return null
  }

  const completionPercent = Math.min(Math.max(Number(project.completionPercent || 0), 0), 100)
  const projectImage = resolveAssetUrl(project.projectImage)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6" onClick={onClose}>
      <section
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-emerald-800">{project.projectType || 'Development Work'}</p>
            <h3 className="mt-1 truncate text-2xl font-black text-slate-950">{project.projectName || 'Untitled Project'}</h3>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="bg-slate-100">
            <div className="grid min-h-72 place-items-center text-emerald-900">
              {projectImage ? (
                <img alt={project.projectName || 'Project'} className="h-full min-h-72 w-full object-cover" src={projectImage} />
              ) : (
                <HardHat className="h-16 w-16" />
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full px-4 py-2 text-xs font-black ${getStatusClass(project.projectStatus)}`}>
                {project.projectStatus || 'Ongoing'}
              </span>
              <p className="text-sm font-black text-emerald-950">{completionPercent}% Complete</p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e7edf8]">
              <div className="h-full rounded-full bg-emerald-950" style={{ width: `${completionPercent}%` }} />
            </div>

            <p className="mt-5 text-sm font-semibold leading-7 text-slate-600">
              {project.description || 'Project information is not available.'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProjectMeta icon={MapPin} label="Location" value={project.location} />
              <ProjectMeta icon={UserRound} label="Contractor" value={project.contractorName} />
              <ProjectMeta icon={CalendarDays} label="Start Date" value={formatDate(project.startDate)} />
              <ProjectMeta icon={CalendarDays} label="Expected End" value={formatDate(project.expectedEndDate)} />
              <ProjectMeta icon={IndianRupee} label="Budget" value={formatAmount(project.budgetAmount)} />
              <ProjectMeta icon={CheckCircle2} label="Sanctioned" value={formatAmount(project.sanctionedAmount)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function GetOngogingProject() {
  const [ongoingProjects, setOngoingProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function loadProjects() {
      const result = await getPublicOngoingProjects()

      if (result.success && Array.isArray(result.data)) {
        setOngoingProjects(result.data)
        setErrorMessage('')
      } else {
        setErrorMessage(result.message || 'Unable to load ongoing projects.')
      }

      setLoading(false)
    }

    loadProjects()
  }, [])

  const statusOptions = useMemo(() => {
    return [...new Set(ongoingProjects.map((project) => project.projectStatus).filter(Boolean))]
  }, [ongoingProjects])

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') {
      return ongoingProjects
    }

    return ongoingProjects.filter((project) => project.projectStatus === statusFilter)
  }, [ongoingProjects, statusFilter])

  function handleProjectKeyDown(event, project) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedProject(project)
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#f4faf8] px-4 py-6 text-slate-950 sm:-m-8 sm:px-8 sm:py-8">
      <ProjectDialog onClose={() => setSelectedProject(null)} project={selectedProject} />

      <section className="rounded-lg bg-[#eaf5f3] p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black text-emerald-900">Gram Panchayat Works</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Ongoing Projects</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              View projects added by admin. Click any project to see full information.
            </p>
          </div>

          <label className="inline-flex h-12 w-full max-w-56 items-center gap-2 rounded-lg bg-emerald-950 px-4 text-sm font-black text-white md:w-auto">
            <Filter className="h-4 w-4" />
            <select
              className="min-w-0 flex-1 bg-transparent text-white outline-none"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option className="text-slate-900" value="all">
                Filter
              </option>
              {statusOptions.map((status) => (
                <option className="text-slate-900" key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">Loading ongoing projects...</div>
      ) : errorMessage ? (
        <div className="mt-6 rounded-lg bg-red-50 p-6 text-sm font-bold text-red-700 shadow-sm">{errorMessage}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-slate-600 shadow-sm">No ongoing projects added yet.</div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectImage = resolveAssetUrl(project.projectImage)

            return (
              <article
                className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100"
                key={project._id}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(event) => handleProjectKeyDown(event, project)}
                role="button"
                tabIndex={0}
              >
                <div className="relative">
                  <div className="grid h-56 place-items-center bg-[#dfeaf4] text-emerald-900">
                    {projectImage ? (
                      <img alt={project.projectName || 'Project'} className="h-full w-full object-cover" src={projectImage} />
                    ) : (
                      <HardHat className="h-12 w-12" />
                    )}
                  </div>
                  <span className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-black shadow-sm ${getStatusClass(project.projectStatus)}`}>
                    {project.projectStatus || 'Ongoing'}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-black text-emerald-800">{project.projectType || 'Development Work'}</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">{project.projectName || 'Untitled Project'}</h3>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">
                    {project.description || 'Project information is not available.'}
                  </p>
                  <p className="mt-auto pt-5 text-xs font-black uppercase text-emerald-800">Click to view details</p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GetOngogingProject
