import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <p>Secret page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear())

  it('redirects to login when there is no token', () => {
    renderPage()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('shows the page when logged in', () => {
    localStorage.setItem('token', 'abc')
    renderPage()
    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })
})
