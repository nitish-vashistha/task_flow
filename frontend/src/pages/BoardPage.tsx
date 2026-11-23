import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTaskApi,
  deleteTaskApi,
  getTasksApi,
  getUsersApi,
  updateTaskApi,
  updateTaskStatusApi,
} from '../api/tasks'
import { getProjectSummaryApi } from '../api/projects'
import { Task, TaskPriority, TaskStatus } from '../types'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import Button from '../components/Button'
import TaskCard from '../components/TaskCard'

const COLUMNS: { key: TaskStatus; label: string; emptyText: string }[] = [
  { key: 'TODO', label: 'To Do', emptyText: 'No tasks in To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress', emptyText: 'No tasks in progress' },
  { key: 'DONE', label: 'Done', emptyText: 'No completed tasks' },
]

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const queryClient = useQueryClient()

  // Filters & Sorting
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('dueDate')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [formError, setFormError] = useState('')

  // Drag-and-drop state
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  // Queries
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
    error: tasksError,
  } = useQuery({
    queryKey: ['tasks', projectId, search, priorityFilter, sortBy],
    queryFn: () =>
      getTasksApi(projectId, {
        search: search.trim() || undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as TaskPriority) : undefined,
        sortBy,
      }),
    enabled: !isNaN(projectId),
  })

  const { data: summary } = useQuery({
    queryKey: ['summary', projectId],
    queryFn: () => getProjectSummaryApi(projectId),
    enabled: !isNaN(projectId),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersApi,
  })

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    queryClient.invalidateQueries({ queryKey: ['summary', projectId] })
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => createTaskApi(projectId, payload),
    onSuccess: () => {
      invalidateData()
      closeModal()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create task')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: any }) =>
      updateTaskApi(taskId, payload),
    onSuccess: () => {
      invalidateData()
      closeModal()
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update task')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      updateTaskStatusApi(taskId, status),
    onSuccess: () => invalidateData(),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => invalidateData(),
  })

  // Modal helpers
  const openCreateModal = () => {
    setEditingTask(null)
    setTitle('')
    setDescription('')
    setStatus('TODO')
    setPriority('MEDIUM')
    setDueDate('')
    setAssigneeId('')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.dueDate || '')
    setAssigneeId(task.assigneeId ? String(task.assigneeId) : '')
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError('Title is required')
      return
    }

    if (title.trim().length > 120) {
      setFormError('Title cannot exceed 120 characters')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]
    if (!editingTask && dueDate && dueDate < todayStr) {
      setFormError('Due date cannot be in the past')
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || null,
      assigneeId: assigneeId ? Number(assigneeId) : null,
    }

    if (editingTask) {
      updateMutation.mutate({ taskId: editingTask.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnStatus: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the column itself, not entering a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    const taskId = Number(e.dataTransfer.getData('application/taskflow-id'))
    const sourceStatus = e.dataTransfer.getData('application/taskflow-status') as TaskStatus

    if (!taskId || sourceStatus === targetStatus) return

    statusMutation.mutate({ taskId, status: targetStatus })
  }

  const tasksByStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s)

  return (
    <div>
      <Navbar />

      <main className="container">
        <div className="breadcrumb">
          <Link to="/projects">&larr; Back to Projects</Link>
        </div>

        {/* Summary Bar */}
        {summary && (
          <div className="summary-bar">
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <span className="summary-value">{summary.total}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">To Do</span>
              <span className="summary-value">{summary.todo}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">In Progress</span>
              <span className="summary-value">{summary.inProgress}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Done</span>
              <span className="summary-value text-done">{summary.done}</span>
            </div>
            <div className={`summary-item ${summary.overdue > 0 ? 'summary-overdue' : ''}`}>
              <span className="summary-label">Overdue</span>
              <span className="summary-value">{summary.overdue}</span>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="board-controls">
          <div className="search-filter-group">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>
          </div>

          <Button onClick={openCreateModal}>+ Add Task</Button>
        </div>

        {isTasksLoading && <div className="state-box">Loading tasks...</div>}

        {isTasksError && (
          <div className="error-banner">
            {(tasksError as any)?.response?.data?.message || 'Failed to load tasks'}
          </div>
        )}

        {/* Kanban Board Columns */}
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus(col.key)
            const isOver = dragOverColumn === col.key
            return (
              <div
                key={col.key}
                className={`kanban-column ${isOver ? 'kanban-column-drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="column-header">
                  <h3>{col.label}</h3>
                  <span className="column-count">{colTasks.length}</span>
                </div>
                <div className="column-cards">
                  {colTasks.length === 0 ? (
                    <div className="column-empty">{col.emptyText}</div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditModal}
                        onDelete={(taskId) => deleteMutation.mutate(taskId)}
                        onStatusChange={(taskId, newStatus) =>
                          statusMutation.mutate({ taskId, status: newStatus })
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Task Modal (Create & Edit) */}
      <Modal
        isOpen={isModalOpen}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        onClose={closeModal}
      >
        {formError && <div className="error-banner">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Title *</label>
            <input
              id="taskTitle"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design auth flow"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDesc">Description</label>
            <textarea
              id="taskDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details and requirements"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="taskStatus">Status</label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="taskDueDate">Due Date</label>
              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="taskAssignee">Assignee</label>
              <select
                id="taskAssignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
