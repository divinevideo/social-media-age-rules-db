import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface ComplianceDecision {
  id: number;
  jurisdiction_id: string;
  decision_state: string;
  min_age_to_access: number | null;
  risk_level: string | null;
  owner: string | null;
  last_reviewed_at: string | null;
  product_controls: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

interface Jurisdiction {
  jurisdiction_id: string;
  name: string;
}

export default function Compliance() {
  const [decisions, setDecisions] = useState<ComplianceDecision[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    jurisdiction_id: '',
    decision_state: '',
    min_age_to_access: '',
    risk_level: '',
    owner: '',
    last_reviewed_at: '',
    product_controls: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [decisionsData, jurisdictionsData] = await Promise.all([
        api.getComplianceDecisions(),
        api.getJurisdictions()
      ]);
      setDecisions(decisionsData.data || []);
      setJurisdictions(jurisdictionsData.data || []);
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
        jurisdiction_id: formData.jurisdiction_id,
        decision_state: formData.decision_state,
        min_age_to_access: formData.min_age_to_access ? parseInt(formData.min_age_to_access) : null,
        risk_level: formData.risk_level || null,
        owner: formData.owner || null,
        last_reviewed_at: formData.last_reviewed_at || null,
        product_controls: formData.product_controls || null,
        notes: formData.notes || null
      };

      if (editingId) {
        await api.updateComplianceDecision(editingId.toString(), payload);
      } else {
        await api.createComplianceDecision(payload);
      }
      
      resetForm();
      loadData();
    } catch (err) {
      alert('Failed to save compliance decision');
      console.error(err);
    }
  };

  const handleEdit = (decision: ComplianceDecision) => {
    setFormData({
      jurisdiction_id: decision.jurisdiction_id,
      decision_state: decision.decision_state,
      min_age_to_access: decision.min_age_to_access?.toString() || '',
      risk_level: decision.risk_level || '',
      owner: decision.owner || '',
      last_reviewed_at: decision.last_reviewed_at || '',
      product_controls: decision.product_controls || '',
      notes: decision.notes || ''
    });
    setEditingId(decision.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this compliance decision?')) return;
    try {
      await api.deleteComplianceDecision(id.toString());
      loadData();
    } catch (err) {
      alert('Failed to delete compliance decision');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      jurisdiction_id: '',
      decision_state: '',
      min_age_to_access: '',
      risk_level: '',
      owner: '',
      last_reviewed_at: '',
      product_controls: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getRiskBadgeColor = (risk: string | null) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Decisions</h1>
          <p className="text-gray-600 mt-1">
            Internal decisions about age enforcement per jurisdiction. Track compliance state, risk levels, and product controls.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Decision'}
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
            {editingId ? 'Edit Compliance Decision' : 'Add New Compliance Decision'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  Decision State *
                </label>
                <select
                  required
                  value={formData.decision_state}
                  onChange={(e) => setFormData({...formData, decision_state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select state...</option>
                  <option value="active">Active</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                  <option value="exempt">Exempt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Age to Access
                </label>
                <input
                  type="number"
                  placeholder="e.g., 13"
                  value={formData.min_age_to_access}
                  onChange={(e) => setFormData({...formData, min_age_to_access: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select risk...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  placeholder="Team or person responsible"
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Reviewed</label>
                <input
                  type="date"
                  value={formData.last_reviewed_at}
                  onChange={(e) => setFormData({...formData, last_reviewed_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Controls
              </label>
              <textarea
                rows={2}
                placeholder="JSON or text describing controls..."
                value={formData.product_controls}
                onChange={(e) => setFormData({...formData, product_controls: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
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
                {editingId ? 'Update' : 'Create'} Decision
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jurisdiction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {decisions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No compliance decisions found. Click "+ Add Decision" to create one, or import data from the Import/Export page.
                </td>
              </tr>
            ) : (
              decisions.map((decision) => (
                <tr key={decision.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{decision.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{decision.jurisdiction_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {decision.decision_state}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {decision.min_age_to_access || <span className="text-gray-400">N/A</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {decision.risk_level ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(decision.risk_level)}`}>
                        {decision.risk_level}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {decision.owner || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(decision)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(decision.id)}
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
