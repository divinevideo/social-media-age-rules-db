// ABOUTME: API client for communicating with the backend

const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
const API_BASE = isDev ? 'http://localhost:8787/api' : '/api'

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Jurisdictions
  getJurisdictions: (params?: any) => 
    fetchApi(`/jurisdictions?${new URLSearchParams(params)}`),
  getJurisdiction: (id: string) => 
    fetchApi(`/jurisdictions/${id}`),
  createJurisdiction: (data: any) => 
    fetchApi('/jurisdictions', { method: 'POST', body: JSON.stringify(data) }),
  updateJurisdiction: (id: string, data: any) => 
    fetchApi(`/jurisdictions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJurisdiction: (id: string) => 
    fetchApi(`/jurisdictions/${id}`, { method: 'DELETE' }),

  // Instruments
  getInstruments: (params?: any) => 
    fetchApi(`/instruments?${new URLSearchParams(params)}`),
  getInstrument: (id: string) => 
    fetchApi(`/instruments/${id}`),
  createInstrument: (data: any) => 
    fetchApi('/instruments', { method: 'POST', body: JSON.stringify(data) }),
  updateInstrument: (id: string, data: any) => 
    fetchApi(`/instruments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstrument: (id: string) => 
    fetchApi(`/instruments/${id}`, { method: 'DELETE' }),

  // Rules
  getRules: (params?: any) => 
    fetchApi(`/rules?${new URLSearchParams(params)}`),
  createRule: (data: any) => 
    fetchApi('/rules', { method: 'POST', body: JSON.stringify(data) }),
  updateRule: (id: string, data: any) => 
    fetchApi(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRule: (id: string) => 
    fetchApi(`/rules/${id}`, { method: 'DELETE' }),

  // Compliance
  getComplianceDecisions: () => 
    fetchApi('/compliance'),
  createComplianceDecision: (data: any) => 
    fetchApi('/compliance', { method: 'POST', body: JSON.stringify(data) }),
  updateComplianceDecision: (id: string, data: any) => 
    fetchApi(`/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteComplianceDecision: (id: string) => 
    fetchApi(`/compliance/${id}`, { method: 'DELETE' }),

  // Cases
  getCases: (params?: any) => 
    fetchApi(`/cases?${new URLSearchParams(params)}`),
  createCase: (data: any) => 
    fetchApi('/cases', { method: 'POST', body: JSON.stringify(data) }),
  updateCase: (id: string, data: any) => 
    fetchApi(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCase: (id: string) => 
    fetchApi(`/cases/${id}`, { method: 'DELETE' }),

  // Sources
  getSources: () => 
    fetchApi('/sources'),
  getSource: (id: string) => 
    fetchApi(`/sources/${id}`),
  createSource: (data: any) => 
    fetchApi('/sources', { method: 'POST', body: JSON.stringify(data) }),
  deleteSource: (id: string) => 
    fetchApi(`/sources/${id}`, { method: 'DELETE' }),

  // Reports
  getAgeByJurisdiction: (params?: any) => 
    fetchApi(`/reports/age-by-jurisdiction?${new URLSearchParams(params)}`),
  getComplianceSummary: () => 
    fetchApi('/reports/compliance-summary'),
  getTimeline: (params?: any) => 
    fetchApi(`/reports/timeline?${new URLSearchParams(params)}`),
  getComparison: (jurisdictions: string[]) => 
    fetchApi(`/reports/compare?jurisdictions=${jurisdictions.join(',')}`),
  getSummary: () => 
    fetchApi('/reports/summary'),

  // Import/Export
  importData: (table: string, data: any[]) => 
    fetchApi('/import/spreadsheet', { 
      method: 'POST', 
      body: JSON.stringify({ table, data }) 
    }),
  exportData: (table: string, format: 'json' | 'csv' = 'json') => 
    fetch(`${API_BASE}/export/${table}?format=${format}`)
      .then(r => format === 'csv' ? r.text() : r.json()),
}
