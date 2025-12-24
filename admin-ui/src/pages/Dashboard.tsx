// ABOUTME: Dashboard showing database statistics and quick actions
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSummary().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Jurisdictions',
      value: stats?.statistics?.total_jurisdictions || 0,
      icon: '🌍',
      color: 'from-blue-500 to-cyan-500',
      link: '/jurisdictions',
      description: 'Countries, states, regions'
    },
    {
      title: 'Instruments',
      value: stats?.statistics?.total_instruments || 0,
      icon: '⚖️',
      color: 'from-purple-500 to-pink-500',
      link: '/instruments',
      description: 'Laws and regulations'
    },
    {
      title: 'Rule Assertions',
      value: stats?.statistics?.total_rules || 0,
      icon: '📋',
      color: 'from-green-500 to-emerald-500',
      link: '/rules',
      description: 'Specific age requirements'
    },
    {
      title: 'Compliance',
      value: stats?.statistics?.total_compliance_decisions || 0,
      icon: '✅',
      color: 'from-orange-500 to-red-500',
      link: '/compliance',
      description: 'Internal decisions'
    },
    {
      title: 'Case Law',
      value: stats?.statistics?.total_case_law_events || 0,
      icon: '🏛️',
      color: 'from-indigo-500 to-purple-500',
      link: '/cases',
      description: 'Court proceedings'
    },
    {
      title: 'Backlog Items',
      value: stats?.statistics?.pending_backlog_items || 0,
      icon: '📌',
      color: 'from-yellow-500 to-orange-500',
      link: '/import-export',
      description: 'Research pending'
    },
  ]

  const quickActions = [
    {
      title: 'Add New Jurisdiction',
      icon: '🌍',
      link: '/jurisdictions',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Add New Law',
      icon: '⚖️',
      link: '/instruments',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'View Reports',
      icon: '📈',
      link: '/reports',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Import Data',
      icon: '💾',
      link: '/import-export',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome to Age Rules Database</h1>
        <p className="text-indigo-100 text-lg">
          Track social media age regulations and compliance across {stats?.statistics?.total_jurisdictions || 0} jurisdictions worldwide
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Database Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-rotate-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{card.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-500">records</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Age Statistics */}
      {stats?.statistics?.age_statistics && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">🎂</span>
            Age Requirements Overview
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <p className="text-sm font-medium text-green-700 mb-2">Minimum Age</p>
              <p className="text-5xl font-bold text-green-600">{stats.statistics.age_statistics.min_age || 'N/A'}</p>
              <p className="text-xs text-green-600 mt-2">years old</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
              <p className="text-sm font-medium text-orange-700 mb-2">Average Age</p>
              <p className="text-5xl font-bold text-orange-600">{Math.round(stats.statistics.age_statistics.avg_age) || 'N/A'}</p>
              <p className="text-xs text-orange-600 mt-2">years old</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
              <p className="text-sm font-medium text-red-700 mb-2">Maximum Age</p>
              <p className="text-5xl font-bold text-red-600">{stats.statistics.age_statistics.max_age || 'N/A'}</p>
              <p className="text-xs text-red-600 mt-2">years old</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`${action.color} text-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:-translate-y-1`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{action.icon}</div>
                <p className="font-semibold text-sm">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Getting Started</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Click any stat card above to view and manage that data type. Use the "+ Add" buttons on each page to create new records manually.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">Generate Reports</h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                Visit the Reports page to analyze age requirements, compliance status, and regulatory timelines across jurisdictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
