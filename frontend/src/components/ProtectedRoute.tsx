import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

// Only lets logged-in users see the page, others go to /login
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
