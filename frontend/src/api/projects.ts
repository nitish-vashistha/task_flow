import client from './client'
import { Project } from '../types'

export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface ProjectSummary {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
}

export const getProjectsApi = async (): Promise<Project[]> => {
  const res = await client.get<Project[]>('/projects')
  return res.data
}

export const createProjectApi = async (payload: CreateProjectPayload): Promise<Project> => {
  const res = await client.post<Project>('/projects', payload)
  return res.data
}

export const getProjectSummaryApi = async (projectId: number): Promise<ProjectSummary> => {
  const res = await client.get<ProjectSummary>(`/projects/${projectId}/summary`)
  return res.data
}
