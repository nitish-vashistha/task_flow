import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import * as authApi from '../api/auth'

vi.mock('../api/auth')

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders email and password inputs and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('submits form and stores token on successful login', async () => {
    const mockLogin = vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      token: 'jwt-token-123',
      id: 1,
      name: 'Alex Morgan',
      email: 'alex@taskflow.dev',
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'alex@taskflow.dev' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alex@taskflow.dev', 'password123')
      expect(localStorage.getItem('token')).toBe('jwt-token-123')
    })
  })

  it('displays error message when login fails', async () => {
    vi.spyOn(authApi, 'loginApi').mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'wrong@taskflow.dev' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})
