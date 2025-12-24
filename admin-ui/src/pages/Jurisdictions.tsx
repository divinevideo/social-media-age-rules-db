// ABOUTME: Jurisdictions management page with modern card design
import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Jurisdictions() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    api.getJurisdictions().then(res => {
      setData(res.data || [])
      setLoading(false)
    })
  }, [])

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jurisdiction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'country': 'bg-blue-100 text-blue-800 border-blue-200',
      'state': 'bg-green-100 text-green-800 border-green-200',
      'supranational': 'bg-purple-100 text-purple-800 border-purple-200',
      'region': 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getLevelIcon = (level: string) => {
    const icons: Record<string, string> = {
      'country': '🏳️',
      'state': '📍',
      'supranational': '🌐',
      'region': '🗺️',
    }
    return icons[level] || '📌'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Loading jurisdictions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-blue-600 bg-clip-text text-transparent mb-2">
            Jurisdictions
          </h1>
          <p className="text-gray-600">
            Countries, states, and regions tracked for age regulations
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search jurisdictions by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredData.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{data.length}</span> jurisdictions
        </p>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((jurisdiction) => (
            <div
              key={jurisdiction.jurisdiction_id}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300 hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getLevelIcon(jurisdiction.level)}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {jurisdiction.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">{jurisdiction.jurisdiction_id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(jurisdiction.level)}`}>
                      {jurisdiction.level}
                    </span>
                    {jurisdiction.iso_code && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {jurisdiction.iso_code}
                      </span>
                    )}
                  </div>
                  
                  {jurisdiction.parent && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Parent: <span className="font-medium">{jurisdiction.parent}</span>
                    </p>
                  )}
                  
                  {jurisdiction.notes && (
                    <p className="text-xs text-gray-500 line-clamp-2 italic">
                      {jurisdiction.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ISO Code</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.map((item: any) => (
                <tr key={item.jurisdiction_id} className="hover:bg-indigo-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{item.jurisdiction_id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(item.level)}`}>
                      {getLevelIcon(item.level)} {item.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.parent || '—'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.iso_code || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jurisdictions found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'Import data to get started'}
          </p>
        </div>
      )}
    </div>
  )
}
