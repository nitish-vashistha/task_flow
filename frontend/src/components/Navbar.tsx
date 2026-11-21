import { useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../auth/token'
import Button from './Button'

export default function Navbar() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/projects')}>
          TaskFlow
        </div>
        <div className="navbar-actions">
          {user && <span className="user-email">{user.name || user.email}</span>}
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
