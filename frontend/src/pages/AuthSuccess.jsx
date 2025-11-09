import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const userJson = urlParams.get('user')
    
    if (token && userJson) {
      try {
        const userData = JSON.parse(decodeURIComponent(userJson))
        
        // Store authentication data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Redirect to dashboard
        navigate('/dashboard')
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/login?error=invalid_data')
      }
    } else {
      // If no token, check if we can get user info from backend
      const checkAuthStatus = async () => {
        try {
          const token = localStorage.getItem('token')
          if (token) {
            // Verify token is still valid
            const response = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (response.ok) {
              const userData = await response.json()
              navigate('/dashboard')
              return
            }
          }
          
          // If no valid token, go to login
          navigate('/login?error=no_token')
        } catch (error) {
          console.error('Auth check failed:', error)
          navigate('/login?error=auth_check_failed')
        }
      }
      
      checkAuthStatus()
    }
  }, [navigate])

  return (
    <div className="container">
      <h1>Completing Authentication</h1>
      <p className="subtitle">Please wait while we complete your authentication...</p>
    </div>
  )
}

export default AuthSuccess