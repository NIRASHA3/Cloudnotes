import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`
    window.location.href = `${backendUrl}/api/auth/google`
  }

  return (
    <div className="app">
      <div className="auth-container">
        <div className="auth-form">
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to access your CloudNotes</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="remember-forgot">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot">Forgot password?</Link>
            </div>

            {error && <div className="error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
            <i class="fas fa-sign-in-alt"></i>
              {loading ? (
                <>
                  <span className="loading">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <button 
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
            />
            Sign in with Google
          </button>

          <div className="signup-link">
            Don't have an account? <Link to="/register">Sign up for free</Link>
          </div>
        </div>

        <div className="auth-image">
          <div className="auth-image-content">
            <img src="/logo.svg" alt="CloudNotes Logo" className="cloud-icon" />
            <h2>Your Notes in the Cloud</h2>
            <p>Access your notes from anywhere, anytime. Secure, fast, and always available.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login