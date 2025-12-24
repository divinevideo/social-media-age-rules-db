import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Source {
  source_id: string;
  what: string;
  url: string | null;
  retrieved: string | null;
  citation_ref: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    source_id: '',
    what: '',
    url: '',
    retrieved: '',
    citation_ref: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getSources();
      setSources(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load sources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        source_id: formData.source_id,
        what: formData.what,
        url: formData.url || null,
        retrieved: formData.retrieved || null,
        citation_ref: formData.citation_ref || null,
        notes: formData.notes || null
      };

      await api.createSource(payload);
      resetForm();
      loadData();
    } catch (err) {
      alert('Failed to create source');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    try {
      await api.deleteSource(id);
      loadData();
    } catch (err) {
      alert('Failed to delete source');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      source_id: '',
      what: '',
      url: '',
      retrieved: '',
      citation_ref: '',
      notes: ''
    });
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-blue-600 bg-clip-text text-transparent mb-2">
            Sources & References
          </h1>
          <p className="text-gray-600 text-lg">
            Reference materials, citations, and source documents
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
        >
          {showForm ? (
            <>
              <span>✕</span> Cancel
            </>
          ) : (
            <>
              <span>+</span> Add Source
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Source</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AUS-OSA-2024"
                  value={formData.source_id}
                  onChange={(e) => setFormData({...formData, source_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Online Safety Act official text"
                  value={formData.what}
                  onChange={(e) => setFormData({...formData, what: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retrieved Date</label>
                <input
                  type="date"
                  value={formData.retrieved}
                  onChange={(e) => setFormData({...formData, retrieved: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citation Reference</label>
                <input
                  type="text"
                  placeholder="e.g., Act No. 105 of 2015"
                  value={formData.citation_ref}
                  onChange={(e) => setFormData({...formData, citation_ref: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={2}
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Source
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retrieved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sources.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No sources found. Click "+ Add Source" to create one, or import data from the Import/Export page.
                </td>
              </tr>
            ) : (
              sources.map((source) => (
                <tr key={source.source_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{source.source_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">{source.what}</td>
                  <td className="px-6 py-4 text-sm">
                    {source.url ? (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 hover:underline flex items-center gap-1"
                      >
                        View
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-400">No URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {source.citation_ref || <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {source.retrieved || <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(source.source_id)}
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
