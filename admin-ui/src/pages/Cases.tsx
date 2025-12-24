import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface CaseLawEvent {
  case_id: string;
  jurisdiction_id: string;
  instrument_id: string | null;
  court_or_body: string | null;
  event_type: string;
  event_date: string | null;
  summary: string | null;
  source_url: string | null;
  created_at: number;
  updated_at: number;
}

interface Jurisdiction {
  jurisdiction_id: string;
  name: string;
}

interface Instrument {
  instrument_id: string;
  title: string;
}

export default function Cases() {
  const [cases, setCases] = useState<CaseLawEvent[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    case_id: '',
    jurisdiction_id: '',
    instrument_id: '',
    court_or_body: '',
    event_type: '',
    event_date: '',
    summary: '',
    source_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, jurisdictionsData, instrumentsData] = await Promise.all([
        api.getCases(),
        api.getJurisdictions(),
        api.getInstruments()
      ]);
      setCases(casesData.data || []);
      setJurisdictions(jurisdictionsData.data || []);
      setInstruments(instrumentsData.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        case_id: formData.case_id,
        jurisdiction_id: formData.jurisdiction_id,
        instrument_id: formData.instrument_id || null,
        court_or_body: formData.court_or_body || null,
        event_type: formData.event_type,
        event_date: formData.event_date || null,
        summary: formData.summary || null,
        source_url: formData.source_url || null
      };

      if (editingId) {
        await api.updateCase(editingId, payload);
      } else {
        await api.createCase(payload);
      }
      
      resetForm();
      loadData();
    } catch (err) {
      alert('Failed to save case law event');
      console.error(err);
    }
  };

  const handleEdit = (caseEvent: CaseLawEvent) => {
    setFormData({
      case_id: caseEvent.case_id,
      jurisdiction_id: caseEvent.jurisdiction_id,
      instrument_id: caseEvent.instrument_id || '',
      court_or_body: caseEvent.court_or_body || '',
      event_type: caseEvent.event_type,
      event_date: caseEvent.event_date || '',
      summary: caseEvent.summary || '',
      source_url: caseEvent.source_url || ''
    });
    setEditingId(caseEvent.case_id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case law event?')) return;
    try {
      await api.deleteCase(id);
      loadData();
    } catch (err) {
      alert('Failed to delete case law event');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      case_id: '',
      jurisdiction_id: '',
      instrument_id: '',
      court_or_body: '',
      event_type: '',
      event_date: '',
      summary: '',
      source_url: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Law Events</h1>
          <p className="text-gray-600 mt-1">
            Court cases and legal proceedings related to age regulations. Track filings, rulings, injunctions, and settlements.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Case'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Case Law Event' : 'Add New Case Law Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NETCHOICE-v-PAXTON-2023"
                  value={formData.case_id}
                  onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jurisdiction *
                </label>
                <select
                  required
                  value={formData.jurisdiction_id}
                  onChange={(e) => setFormData({...formData, jurisdiction_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select jurisdiction...</option>
                  {jurisdictions.map((j) => (
                    <option key={j.jurisdiction_id} value={j.jurisdiction_id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Instrument (optional)
                </label>
                <select
                  value={formData.instrument_id}
                  onChange={(e) => setFormData({...formData, instrument_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {instruments.map((i) => (
                    <option key={i.instrument_id} value={i.instrument_id}>
                      {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court or Body
                </label>
                <input
                  type="text"
                  placeholder="e.g., US District Court for the Western District of Texas"
                  value={formData.court_or_body}
                  onChange={(e) => setFormData({...formData, court_or_body: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  required
                  value={formData.event_type}
                  onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select type...</option>
                  <option value="filing">Filing</option>
                  <option value="ruling">Ruling</option>
                  <option value="injunction">Injunction</option>
                  <option value="settlement">Settlement</option>
                  <option value="appeal">Appeal</option>
                  <option value="hearing">Hearing</option>
                  <option value="decision">Decision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea
                rows={3}
                placeholder="Brief description of the case event..."
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.source_url}
                onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingId ? 'Update' : 'Create'} Case Event
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jurisdiction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No case law events found. Click "+ Add Case" to create one, or import data from the Import/Export page.
                </td>
              </tr>
            ) : (
              cases.map((caseEvent) => (
                <tr key={caseEvent.case_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseEvent.case_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{caseEvent.jurisdiction_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      {caseEvent.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {caseEvent.event_date || <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    {caseEvent.summary || <span className="text-gray-400">No summary</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {caseEvent.source_url ? (
                      <a 
                        href={caseEvent.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        View →
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(caseEvent)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(caseEvent.case_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
