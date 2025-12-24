// ABOUTME: Import/Export page for bulk data operations
import { useState } from 'react'
import { api } from '../api/client'

export default function ImportExport() {
  const [importTable, setImportTable] = useState('jurisdictions')
  const [importData, setImportData] = useState('')
  const [importResult, setImportResult] = useState<any>(null)
  const [exportTable, setExportTable] = useState('jurisdictions')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tables = [
    'jurisdictions',
    'instruments',
    'rule_assertions',
    'compliance_decisions',
    'case_law_events',
    'sources',
    'regulatory_families',
    'coverage_backlog',
    'us_state_matrix'
  ]

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    setImportResult(null)

    try {
      const data = JSON.parse(importData)
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects')
      }

      const result = await api.importData(importTable, data)
      setImportResult(result)
      setImportData('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await api.exportData(exportTable, exportFormat)
      
      if (exportFormat === 'csv') {
        // Download CSV
        const blob = new Blob([data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${exportTable}.csv`
        a.click()
      } else {
        // Display JSON
        const formatted = JSON.stringify(data, null, 2)
        const blob = new Blob([formatted], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${exportTable}.json`
        a.click()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-purple-600 bg-clip-text text-transparent mb-2">
          Import / Export Data
        </h1>
        <p className="text-gray-600 text-lg">
          Bulk data operations for loading and downloading database records
        </p>
      </div>

      {/* Quick Help Banner */}
      <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-8">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          How to Use This Page
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-indigo-800">
          <div>
            <p className="font-semibold mb-1">📥 Import (Load Data)</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Copy JSON from generated files</li>
              <li>Select the correct table name</li>
              <li>Paste JSON and click Import</li>
              <li>Watch for success/error messages</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">📤 Export (Download Data)</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Select table and format (JSON/CSV)</li>
              <li>Click Export to download file</li>
              <li>Use for backups or sharing data</li>
              <li>CSV opens in Excel/Sheets</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-red-900">Error:</p>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">📥 Import Data</h2>
            <p className="text-sm text-gray-600 mt-1">
              Load bulk data from JSON files. Data must be a JSON array of objects matching the table schema.
            </p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</p>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Import order matters! Import parent tables before child tables (see order below)</li>
            <li>Duplicate IDs will UPDATE existing records</li>
            <li>Invalid foreign keys will cause errors</li>
            <li>All fields must match the database schema</li>
          </ul>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 Recommended Import Order:</p>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li><strong>jurisdictions</strong> - No dependencies</li>
            <li><strong>instruments</strong> - Depends on jurisdictions</li>
            <li><strong>rule_assertions</strong> - Depends on jurisdictions + instruments</li>
            <li><strong>compliance_decisions</strong> - Depends on jurisdictions</li>
            <li><strong>case_law_events</strong> - Depends on jurisdictions (+ optional instruments)</li>
            <li><strong>sources</strong> - No dependencies</li>
            <li><strong>regulatory_families</strong> - No dependencies</li>
            <li><strong>coverage_backlog</strong> - Depends on jurisdictions (optional)</li>
            <li><strong>us_state_matrix</strong> - Depends on jurisdictions</li>
          </ol>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Table
          </label>
          <select
            value={importTable}
            onChange={(e) => setImportTable(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {tables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Data
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={10}
            placeholder='[{"jurisdiction_id": "TEST", "name": "Test", ...}]'
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !importData}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Importing...' : 'Import Data'}
        </button>

        {importResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-semibold">Import Complete!</p>
            <p className="text-sm text-green-700">
              Imported: {importResult.imported} / {importResult.total} records
            </p>
            {importResult.errors && (
              <p className="text-sm text-red-600 mt-2">
                Errors: {importResult.errors.length}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📤 Export Data</h2>
          <p className="text-sm text-gray-600 mt-1">
            Download table data for backup, sharing, or viewing in spreadsheet software.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table
            </label>
            <select
              value={exportTable}
              onChange={(e) => setExportTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Exporting...' : 'Export Data'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Export data first to see the correct format for imports</li>
          <li>Import uses INSERT OR REPLACE, so existing records with same ID will be updated</li>
          <li>For large imports, consider breaking into smaller batches</li>
          <li>CSV exports can be opened in Excel or Google Sheets</li>
        </ul>
      </div>
    </div>
  )
}
