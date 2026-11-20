import './i18n'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import FindParking from './pages/FindParking'
import SpaceDetails from './pages/SpaceDetails'
import ActiveParking from './pages/ActiveParking'
import MyBookings from './pages/MyBookings'
import OwnerDashboard from './pages/OwnerDashboard'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/find" element={<FindParking />} />
        <Route path="/space/:id" element={<SpaceDetails />} />
        <Route
          path="/active"
          element={
            <ProtectedRoute roles={['driver', 'owner']}>
              <ActiveParking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['driver', 'owner']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}