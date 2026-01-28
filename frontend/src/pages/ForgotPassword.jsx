import { useState } from 'react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset instructions')
      }

      setMessage('Password reset instructions have been sent to your email address.')
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="auth-container">
        <div className="auth-form">
          <div className="password-reset-icon"><i class="fas fa-lock"></i></div>
          <h1>Forgot Password?</h1>
          <p className="subtitle">Enter your email address and we'll send you instructions to reset your password.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="password-reset-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">Enter your email address above</div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">Check your email for reset instructions</div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">Follow the link to create a new password</div>
            </div>
          </div>

          <div className="back-to-login">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword