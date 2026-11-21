export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Project {
  id: number
  name: string
  description: string
  createdAt: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: number | null
  assigneeName?: string | null
  projectId?: number
  createdAt?: string
  updatedAt?: string
}

export interface AppUser {
  id: number
  name: string
  email: string
}
