// ABOUTME: Main layout component with navigation sidebar
import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Jurisdictions', path: '/jurisdictions', icon: '🌍' },
    { name: 'Instruments', path: '/instruments', icon: '⚖️' },
    { name: 'Rule Assertions', path: '/rules', icon: '📋' },
    { name: 'Compliance', path: '/compliance', icon: '✅' },
    { name: 'Case Law', path: '/cases', icon: '🏛️' },
    { name: 'Sources', path: '/sources', icon: '📚' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Import/Export', path: '/import-export', icon: '💾' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 min-h-screen shadow-2xl">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg">
                📜
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight">Age Rules DB</h1>
                <p className="text-indigo-300 text-xs font-medium">diVine.video Admin</p>
              </div>
            </div>
          </div>
          <nav className="mt-2 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-indigo-900 shadow-lg transform scale-105'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white hover:transform hover:translate-x-1'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-900 to-blue-600 bg-clip-text text-transparent">
                Social Media Age Rules Database
              </h2>
              <p className="text-sm text-gray-600 mt-1">Global compliance tracking and research</p>
            </div>
          </header>
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
