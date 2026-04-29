import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Reports from './pages/Reports';

const activeClass = 'bg-white/20 text-white';
const inactiveClass = 'text-blue-100 hover:bg-white/10 hover:text-white';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />

      <nav className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="font-semibold text-base tracking-wide">LeadTracker</span>

            <div className="flex gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/leads"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`
                }
              >
                Leads
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`
                }
              >
                Reports
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-200 py-3 text-center text-xs text-gray-400">
        © 2025 Acolyte Technologies
      </footer>
    </div>
  );
}
