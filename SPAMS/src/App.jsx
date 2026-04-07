import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentProjects from './pages/student/Projects'
import StudentMyProject from './pages/student/MyProject'

import FacultyDashboard from './pages/faculty/Dashboard'
import FacultyProfile from './pages/faculty/Profile'
import FacultyProjects from './pages/faculty/Projects'
import FacultyStudents from './pages/faculty/Students'
import FacultyProjectDetail from './pages/faculty/ProjectDetail'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.user_metadata?.role !== role) {
    return <Navigate to={user.user_metadata?.role === 'faculty' ? '/faculty' : '/student'} replace />
  }
  return children
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-void flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p className="text-text-muted font-body text-sm">Loading ProjectHub...</p>
    </div>
  </div>
)

const AppRoutes = () => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.user_metadata?.role === 'faculty' ? '/faculty' : '/student'} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.user_metadata?.role === 'faculty' ? '/faculty' : '/student'} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.user_metadata?.role === 'faculty' ? '/faculty' : '/student'} /> : <RegisterPage />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/projects" element={<ProtectedRoute role="student"><StudentProjects /></ProtectedRoute>} />
      <Route path="/student/my-project" element={<ProtectedRoute role="student"><StudentMyProject /></ProtectedRoute>} />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/profile" element={<ProtectedRoute role="faculty"><FacultyProfile /></ProtectedRoute>} />
      <Route path="/faculty/projects" element={<ProtectedRoute role="faculty"><FacultyProjects /></ProtectedRoute>} />
      <Route path="/faculty/projects/:id" element={<ProtectedRoute role="faculty"><FacultyProjectDetail /></ProtectedRoute>} />
      <Route path="/faculty/students" element={<ProtectedRoute role="faculty"><FacultyStudents /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise-bg">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
