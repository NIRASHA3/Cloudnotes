import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthSuccess from './pages/AuthSuccess'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword';
import AllNotes from './pages/AllNotes';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import PinnedNotes from './pages/PinnedNotes';
import SearchNotes from './pages/SearchNotes';
import Categories from './pages/Categories';
import Navbar from './components/Navbar';
import ViewNote from './pages/ViewNote';
import './index.css'
import bgImage from './assets/y.jpg';

function App() {
  return (
    <Router>
      <div
        className="app"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Show navbar only on authenticated routes */}
        <Routes>
          {/* Public routes without navbar */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          
          {/* Protected routes with navbar */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/notes" element={<AllNotes />} />
                  <Route path="/notes/create" element={<CreateNote />} />
                  <Route path="/notes/edit/:id" element={<EditNote />} />
                  <Route path="/notes/:id" element={<ViewNote />} />
                  <Route path="/pinned" element={<PinnedNotes />} />
                  <Route path="/search" element={<SearchNotes />} />
                  <Route path="/categories" element={<Categories />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App