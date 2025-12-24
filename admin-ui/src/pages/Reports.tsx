// ABOUTME: Reports page for generating various analytics and comparisons
import { useState } from 'react'
import { api } from '../api/client'

export default function Reports() {
  const [activeReport, setActiveReport] = useState<string>('summary')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [jurisdictionId, setJurisdictionId] = useState('')
  const [jurisdictionLevel, setJurisdictionLevel] = useState('')
  const [yearStart, setYearStart] = useState('')
  const [yearEnd, setYearEnd] = useState('')
  const [compareJurisdictions, setCompareJurisdictions] = useState('')

  const downloadCSV = (data: any) => {
    // Extract the data array from the report
    let records: any[] = []
    
    if (data.data && Array.isArray(data.data)) {
      records = data.data
    } else if (Array.isArray(data.statistics)) {
      records = [data.statistics]
    } else if (data.statistics) {
      // Convert statistics object to array
      records = Object.entries(data.statistics).map(([key, value]) => ({ metric: key, value }))
    } else if (data.jurisdictions) {
      // For comparison reports
      records = data.jurisdictions
    }

    if (records.length === 0) {
      alert('No data to export')
      return
    }

    // Get all unique keys from all records
    const allKeys = new Set<string>()
    records.forEach(record => {
      Object.keys(record).forEach(key => allKeys.add(key))
    })
    const headers = Array.from(allKeys)

    // Build CSV content
    const csvRows = []
    
    // Add header row
    csvRows.push(headers.map(h => `"${h}"`).join(','))
    
    // Add data rows
    records.forEach(record => {
      const row = headers.map(header => {
        const value = record[header]
        // Handle null, undefined, objects, arrays
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        // Escape quotes in strings
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const filename = `${data.report_type || 'report'}_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const runReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let data
      switch (activeReport) {
        case 'age-by-jurisdiction':
          data = await api.getAgeByJurisdiction({ 
            jurisdiction_id: jurisdictionId || undefined,
            level: jurisdictionLevel || undefined
          })
          break
        case 'compliance-summary':
          data = await api.getComplianceSummary()
          break
        case 'timeline':
          data = await api.getTimeline({ 
            jurisdiction_id: jurisdictionId || undefined,
            year_start: yearStart || undefined,
            year_end: yearEnd || undefined
          })
          break
        case 'compare':
          if (!compareJurisdictions) {
            throw new Error('Please enter at least 2 jurisdiction IDs separated by commas')
          }
          data = await api.getComparison(compareJurisdictions.split(',').map(j => j.trim()))
          break
        default:
          data = await api.getSummary()
      }
      setReportData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    { id: 'summary', label: 'Summary Statistics', icon: '📊', color: 'from-blue-500 to-cyan-500' },
    { id: 'age-by-jurisdiction', label: 'Age by Jurisdiction', icon: '🌍', color: 'from-green-500 to-emerald-500' },
    { id: 'compliance-summary', label: 'Compliance Summary', icon: '✅', color: 'from-orange-500 to-red-500' },
    { id: 'timeline', label: 'Regulatory Timeline', icon: '📅', color: 'from-purple-500 to-pink-500' },
    { id: 'compare', label: 'Compare Jurisdictions', icon: '⚖️', color: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 to-emerald-600 bg-clip-text text-transparent mb-2">
          Reports & Analysis
        </h1>
        <p className="text-gray-600 text-lg">
          Generate comprehensive reports on age regulations and compliance
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📈</span>
          Select Report Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => {
                setActiveReport(report.id)
                setReportData(null)
              }}
              className={`group p-6 rounded-xl font-medium transition-all duration-300 border-2 ${
                activeReport === report.id
                  ? `bg-gradient-to-br ${report.color} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-105'
              }`}
            >
              <div className="text-4xl mb-3">{report.icon}</div>
              <div className="text-sm font-semibold">{report.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        
        {activeReport === 'age-by-jurisdiction' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction ID (optional)
              </label>
              <input
                type="text"
                value={jurisdictionId}
                onChange={(e) => setJurisdictionId(e.target.value)}
                placeholder="e.g., AUS, USA-FL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction Level (optional)
              </label>
              <select
                value={jurisdictionLevel}
                onChange={(e) => setJurisdictionLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Levels</option>
                <option value="country">Country</option>
                <option value="state">State</option>
                <option value="supranational">Supranational</option>
              </select>
            </div>
          </div>
        )}

        {activeReport === 'timeline' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurisdiction ID (optional)
              </label>
              <input
                type="text"
                value={jurisdictionId}
                onChange={(e) => setJurisdictionId(e.target.value)}
                placeholder="e.g., AUS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Start (optional)
              </label>
              <input
                type="number"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year End (optional)
              </label>
              <input
                type="number"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                placeholder="2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}

        {activeReport === 'compare' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurisdiction IDs (comma-separated, minimum 2)
            </label>
            <input
              type="text"
              value={compareJurisdictions}
              onChange={(e) => setCompareJurisdictions(e.target.value)}
              placeholder="e.g., AUS, GBR, USA-FL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <button
          onClick={runReport}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {reportData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Generated: {new Date(reportData.generated_at).toLocaleString()}
              </span>
              <button
                onClick={() => downloadCSV(reportData)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-auto max-h-96">
            <pre className="text-sm bg-gray-50 p-4 rounded border">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>

          {reportData.data && Array.isArray(reportData.data) && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Total Records: {reportData.data.length}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
