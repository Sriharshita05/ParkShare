import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import FindParking from './pages/FindParking'
import SpaceDetails from './pages/SpaceDetails'
import ActiveParking from './pages/ActiveParking'
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
        <Route path="/active" element={<ActiveParking />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
