import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Landing Page
import Landing from './pages/landing/Landing';

// Auth.js
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';

// Owner Pages
import OwnerLayout from './pages/owner/OwnerLayout';
import Dashboard from './pages/owner/Dashboard';
import Vehicles from './pages/owner/Vehicles';
import Drivers from './pages/owner/Drivers';
import Documents from './pages/owner/Documents';
import Expenses from './pages/owner/Expenses';
import OwnerNotifications from './pages/owner/Notifications';
import EngineHealth from './pages/owner/EngineHealth';
import FleetAnalytics from './pages/owner/FleetAnalytics';

// Driver Pages
import DriverLayout from './pages/driver/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import DailyChecklist from './pages/driver/DailyChecklist';
import DriverExpenses from './pages/driver/DriverExpenses';
import DriverNotifications from './pages/driver/DriverNotifications';
import DriverEngineHealth from './pages/driver/DriverEngineHealth';

import './index.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1F2937',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Owner Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="documents" element={<Documents />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="notifications" element={<OwnerNotifications />} />
          <Route path="engine-health" element={<EngineHealth />} />
          <Route path="analytics" element={<FleetAnalytics />} />
        </Route>

        {/* Driver Routes */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<DriverDashboard />} />
          <Route path="checklist" element={<DailyChecklist />} />
          <Route path="expenses" element={<DriverExpenses />} />
          <Route path="notifications" element={<DriverNotifications />} />
          <Route path="engine-health" element={<DriverEngineHealth />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
