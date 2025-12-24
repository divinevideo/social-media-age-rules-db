// ABOUTME: Instruments management page with modern card design
import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function Instruments() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    api.getInstruments().then(res => {
      setData(res.data || [])
      setLoading(false)
    })
  }, [])

  const filteredData = data.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.instrument_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || item.instrument_type === filterType
    const matchesStatus = !filterStatus || item.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const uniqueTypes = [...new Set(data.map(i => i.instrument_type).filter(Boolean))]
  const uniqueStatuses = [...new Set(data.map(i => i.status).filter(Boolean))]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'enacted': 'bg-green-100 text-green-800 border-green-300',
      'proposed': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'in force': 'bg-blue-100 text-blue-800 border-blue-300',
      'repealed': 'bg-red-100 text-red-800 border-red-300',
      'draft': 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'statute': '📜',
      'bill': '📄',
      'regulation': '⚙️',
      'guideline': '📋',
      'code': '📖',
      'act': '⚖️',
    }
    return icons[type?.toLowerCase()] || '📄'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Loading instruments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-600 bg-clip-text text-transparent mb-2">
            Instruments
          </h1>
          <p className="text-gray-600">
            Laws, regulations, and legislative instruments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredData.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{data.length}</span> instruments
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((instrument) => (
          <div
            key={instrument.instrument_id}
            className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-300"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">{getTypeIcon(instrument.instrument_type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-1 line-clamp-2">
                    {instrument.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono">{instrument.instrument_id}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(instrument.status)}`}>
                  {instrument.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  {instrument.instrument_type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {instrument.jurisdiction_id}
                </span>
              </div>

              {/* Dates */}
              {instrument.effective_or_commencement_date && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-700">Effective Date</p>
                  <p className="text-sm font-semibold text-blue-900">{instrument.effective_or_commencement_date}</p>
                </div>
              )}

              {/* Age Rule */}
              {instrument.min_age_rule && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">Age Rule</p>
                  <p className="text-sm text-green-900">{instrument.min_age_rule}</p>
                </div>
              )}

              {/* Source Link */}
              {instrument.source_url && (
                <a
                  href={instrument.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Official Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No instruments found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType || filterStatus 
              ? 'Try adjusting your filters' 
              : 'Import data to get started'}
          </p>
        </div>
      )}
    </div>
  )
}
