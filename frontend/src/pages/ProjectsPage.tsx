import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProjectApi, getProjectsApi } from '../api/projects'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import Button from '../components/Button'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjectsApi,
  })

  const createMutation = useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsModalOpen(false)
      setName('')
      setDescription('')
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create project')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Project name is required')
      return
    }
    createMutation.mutate({ name: name.trim(), description: description.trim() })
  }

  return (
    <div>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <div>
            <h1>Your Projects</h1>
            <p className="page-subtitle">Manage and track your team tasks</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ New Project</Button>
        </div>

        {isLoading && <div className="state-box">Loading projects...</div>}

        {isError && (
          <div className="error-banner">
            {(error as any)?.response?.data?.message || 'Failed to load projects'}
          </div>
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
            <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </div>
        )}

        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <h3>{project.name}</h3>
              <p className="project-desc">{project.description || 'No description provided.'}</p>
              <div className="project-footer">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span className="view-link">View Board &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal isOpen={isModalOpen} title="Create Project" onClose={() => setIsModalOpen(false)}>
        {formError && <div className="error-banner">{formError}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name *</label>
            <input
              id="projectName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectDesc">Description</label>
            <textarea
              id="projectDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the project"
            />
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
