import client from './client'
import { AppUser, Task, TaskPriority, TaskStatus } from '../types'

export interface TaskQueryParams {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  sortBy?: string
  direction?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: number | null
}

export interface UpdateTaskPayload {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  assigneeId?: number | null
}

export const getTasksApi = async (projectId: number, params?: TaskQueryParams): Promise<Task[]> => {
  const res = await client.get(`/projects/${projectId}/tasks`, { params })
  // Backend returns Page<TaskResponse>
  if (res.data && Array.isArray(res.data.content)) {
    return res.data.content
  }
  return Array.isArray(res.data) ? res.data : []
}

export const createTaskApi = async (projectId: number, payload: CreateTaskPayload): Promise<Task> => {
  const res = await client.post<Task>(`/projects/${projectId}/tasks`, payload)
  return res.data
}

export const updateTaskApi = async (taskId: number, payload: UpdateTaskPayload): Promise<Task> => {
  const res = await client.put<Task>(`/tasks/${taskId}`, payload)
  return res.data
}

export const updateTaskStatusApi = async (taskId: number, status: TaskStatus): Promise<Task> => {
  const res = await client.patch<Task>(`/tasks/${taskId}/status`, { status })
  return res.data
}

export const deleteTaskApi = async (taskId: number): Promise<void> => {
  await client.delete(`/tasks/${taskId}`)
}

export const getUsersApi = async (): Promise<AppUser[]> => {
  const res = await client.get<AppUser[]>('/users')
  return res.data
}
