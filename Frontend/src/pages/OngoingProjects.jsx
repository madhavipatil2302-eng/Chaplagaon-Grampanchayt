import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ClipboardList,
  Edit3,
  ImageUp,
  IndianRupee,
  MapPin,
  Percent,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react'

import Toast from '../components/Toast'
import { deleteOngoingProject, saveOngoingProject, getOngoingProjects, updateOngoingProject } from '../Services/moduleDataService'
import { resolveAssetUrl } from '../Services/homeservices'

const emptyProjectData = {
  projectName: '',
  projectType: '',
  location: '',
  startDate: '',
  expectedEndDate: '',
  budgetAmount: '',
  sanctionedAmount: '',
  contractorName: '',
  projectStatus: '',
  completionPercent: '',
  description: '',
  projectImage: null,
  projectImagePreview: '',
  projectImageName: '',
}

const projectTypeOptions = ['Road Work', 'Water Supply', 'Drainage', 'Building', 'Street Light', 'Sanitation', 'Other']
const statusOptions = ['Planning', 'Ongoing', 'On Hold', 'Near Completion', 'Completed']

const projectFields = [
  { name: 'projectName', label: 'Project Name', icon: ClipboardList },
  { name: 'projectType', label: 'Project Type', icon: ClipboardList, type: 'select', options: projectTypeOptions },
  { name: 'location', label: 'Location / Ward', icon: MapPin },
  { name: 'startDate', label: 'Start Date', icon: CalendarDays, type: 'date' },
  { name: 'expectedEndDate', label: 'Expected End Date', icon: CalendarDays, type: 'date' },
  { name: 'budgetAmount', label: 'Budget Amount', icon: IndianRupee, type: 'number' },
  { name: 'sanctionedAmount', label: 'Sanctioned Amount', icon: IndianRupee, type: 'number' },
  { name: 'contractorName', label: 'Contractor / Agency Name', icon: UserRound },
  { name: 'projectStatus', label: 'Project Status', icon: ClipboardList, type: 'select', options: statusOptions },
  { name: 'completionPercent', label: 'Completion (%)', icon: Percent, type: 'number' },
]

function normalizeProjectForForm(project) {
  return {
    ...emptyProjectData,
    ...project,
    startDate: project.startDate ? project.startDate.slice(0, 10) : '',
    expectedEndDate: project.expectedEndDate ? project.expectedEndDate.slice(0, 10) : '',
    projectImage: null,
    projectImagePreview: resolveAssetUrl(project.projectImage),
  }
}

function ProjectField({ field, onChange, value }) {
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
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
          max={field.name === 'completionPercent' ? 100 : undefined}
          min={field.type === 'number' ? 0 : undefined}
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

function OngoingProjects() {
  const [projectData, setProjectData] = useState(emptyProjectData)
  const [projects, setProjects] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    async function loadProject() {
      const result = await getOngoingProjects()

      if (result.success && Array.isArray(result.data)) {
        setProjects(result.data)
      }
    }

    loadProject()

  
  }, [])

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => {
      setToast({ message: '', type: nextToast.type })
    }, 2500)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setProjectData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null

    if (!file) {
      setProjectData((currentData) => ({
        ...currentData,
        projectImage: null,
        projectImagePreview: resolveAssetUrl(currentData.projectImage),
        projectImageName: currentData.projectImageName || '',
      }))
      return
    }

    const objectUrl = URL.createObjectURL(file)

    setProjectData((currentData) => ({
      ...currentData,
      projectImage: file,
      projectImagePreview: objectUrl,
      projectImageName: file.name,
    }))
  }

  function handleReset() {
    setProjectData(emptyProjectData)
    showToast({ message: 'Ongoing project form reset successfully.', type: 'success' })
  }

  function handleEdit(project) {
    setProjectData(normalizeProjectForForm(project))
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  async function handleDelete(projectId) {
    const result = await deleteOngoingProject(projectId)

    if (result.success) {
      setProjects((currentProjects) => currentProjects.filter((project) => project._id !== projectId))
      if (projectData._id === projectId) {
        setProjectData(emptyProjectData)
      }
      showToast({ message: result.message || 'Ongoing project deleted successfully.', type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    const result = projectData._id
      ? await updateOngoingProject(projectData._id, projectData)
      : await saveOngoingProject(projectData)

    if (result.success && result.data) {
      setProjectData(normalizeProjectForForm(result.data))
      setProjects((currentProjects) =>
        projectData._id
          ? currentProjects.map((project) => (project._id === result.data._id ? result.data : project))
          : [result.data, ...currentProjects]
      )
      showToast({ message: result.message, type: 'success' })
    } else {
      showToast({ message: result.message, type: 'error' })
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Toast message={toast.message} onClose={() => setToast({ message: '', type: toast.type })} type={toast.type} />

      <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="rounded-lg border border-emerald-100 bg-emerald-950 p-6 text-white shadow-lg shadow-emerald-950/10">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Ongoing Project</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{projectData._id ? 'Edit Ongoing Project' : projectData.projectName || 'Add Ongoing Project'}</h2>
            <p className="mt-3 text-sm font-bold text-emerald-100">Track development work, budget, agency and completion status.</p>
          </div>

          <div className="rounded-lg border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-emerald-100">Completion</p>
            <p className="mt-2 text-3xl font-black">{projectData.completionPercent || 0}%</p>
            <p className="mt-1 text-sm font-bold text-emerald-100">{projectData.projectStatus || 'Status pending'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-black text-neutral-950">Project Details</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {projectFields.map((field) => (
            <ProjectField field={field} key={field.name} onChange={handleChange} value={projectData[field.name]} />
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-black uppercase text-neutral-500">Project Description</span>
          <textarea
            className="min-h-32 w-full rounded-lg border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            name="description"
            onChange={handleChange}
            placeholder="Enter project description"
            value={projectData.description}
          />
        </label>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-black text-neutral-950">Project Image</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-[18rem_1fr] lg:items-center">
          <div className="grid min-h-48 place-items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
            {projectData.projectImagePreview ? (
              <div
                aria-label={projectData.projectName || 'Project preview'}
                className="h-40 w-full rounded-lg bg-contain bg-center bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url("${projectData.projectImagePreview}")` }}
              />
            ) : (
              <div className="text-center text-sm font-bold text-neutral-500">
                <ImageUp className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
                {projectData.projectImageName || 'No project image selected'}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
              <ImageUp className="h-4 w-4 text-emerald-800" />
              Upload Project Image
            </span>
            <input
              accept="image/*"
              className="block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-emerald-900"
              onChange={handleImageChange}
              type="file"
            />
          </label>
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
          {saving ? 'Saving...' : projectData._id ? 'Update Project' : 'Save Project'}
        </button>
      </div>
      </form>

      {projects.length > 0 && (
        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black text-neutral-950">Added Projects</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <article className="rounded-lg border border-neutral-200 p-4" key={project._id}>
                <div className="flex gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100">
                    {project.projectImage ? (
                      <img
                        alt={project.projectName || 'Project'}
                        className="h-full w-full object-cover"
                        src={resolveAssetUrl(project.projectImage)}
                      />
                    ) : (
                      <ClipboardList className="h-8 w-8 text-neutral-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase text-emerald-800">{project.projectStatus || 'Status pending'}</p>
                    <h4 className="mt-1 truncate text-lg font-black text-neutral-950">{project.projectName || 'Untitled Project'}</h4>
                    <p className="mt-1 text-sm font-semibold text-neutral-600">{project.projectType || 'Development Work'}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-xs font-black text-emerald-800 hover:bg-emerald-100"
                    onClick={() => handleEdit(project)}
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 hover:bg-red-100"
                    onClick={() => handleDelete(project._id)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default OngoingProjects
