import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface RuleAssertion {
  id: number;
  jurisdiction_id: string;
  instrument_id: string;
  rule_type: string;
  age_min: number | null;
  age_max: number | null;
  requirement: string;
  confidence: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  effective_date: string | null;
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

export default function Rules() {
  const [rules, setRules] = useState<RuleAssertion[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    jurisdiction_id: '',
    instrument_id: '',
    rule_type: '',
    age_min: '',
    age_max: '',
    requirement: '',
    confidence: '',
    reviewed_by: '',
    reviewed_at: '',
    effective_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, jurisdictionsData, instrumentsData] = await Promise.all([
        api.getRules(),
        api.getJurisdictions(),
        api.getInstruments()
      ]);
      setRules(rulesData.data || []);
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
        jurisdiction_id: formData.jurisdiction_id,
        instrument_id: formData.instrument_id,
        rule_type: formData.rule_type,
        age_min: formData.age_min ? parseInt(formData.age_min) : null,
        age_max: formData.age_max ? parseInt(formData.age_max) : null,
        requirement: formData.requirement,
        confidence: formData.confidence ? parseFloat(formData.confidence) : null,
        reviewed_by: formData.reviewed_by || null,
        reviewed_at: formData.reviewed_at || null,
        effective_date: formData.effective_date || null
      };

      if (editingId) {
        await api.updateRule(editingId.toString(), payload);
      } else {
        await api.createRule(payload);
      }
      
      resetForm();
      loadData();
    } catch (err) {
      alert('Failed to save rule assertion');
      console.error(err);
    }
  };

  const handleEdit = (rule: RuleAssertion) => {
    setFormData({
      jurisdiction_id: rule.jurisdiction_id,
      instrument_id: rule.instrument_id,
      rule_type: rule.rule_type,
      age_min: rule.age_min?.toString() || '',
      age_max: rule.age_max?.toString() || '',
      requirement: rule.requirement,
      confidence: rule.confidence?.toString() || '',
      reviewed_by: rule.reviewed_by || '',
      reviewed_at: rule.reviewed_at || '',
      effective_date: rule.effective_date || ''
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule assertion?')) return;
    try {
      await api.deleteRule(id.toString());
      loadData();
    } catch (err) {
      alert('Failed to delete rule assertion');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      jurisdiction_id: '',
      instrument_id: '',
      rule_type: '',
      age_min: '',
      age_max: '',
      requirement: '',
      confidence: '',
      reviewed_by: '',
      reviewed_at: '',
      effective_date: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rule Assertions</h1>
          <p className="text-gray-600 mt-1">
            Specific age rules extracted from instruments. Each rule assertion links to a jurisdiction and instrument.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Rule'}
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
            {editingId ? 'Edit Rule Assertion' : 'Add New Rule Assertion'}
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
                  Instrument *
                </label>
                <select
                  required
                  value={formData.instrument_id}
                  onChange={(e) => setFormData({...formData, instrument_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select instrument...</option>
                  {instruments.map((i) => (
                    <option key={i.instrument_id} value={i.instrument_id}>
                      {i.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MINIMUM_AGE_FOR_ACCOUNT"
                  value={formData.rule_type}
                  onChange={(e) => setFormData({...formData, rule_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    placeholder="e.g., 13"
                    value={formData.age_min}
                    onChange={(e) => setFormData({...formData, age_min: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    placeholder="e.g., 17"
                    value={formData.age_max}
                    onChange={(e) => setFormData({...formData, age_max: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirement *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Description of the requirement..."
                value={formData.requirement}
                onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.95"
                  value={formData.confidence}
                  onChange={(e) => setFormData({...formData, confidence: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                <input
                  type="text"
                  placeholder="Reviewer name"
                  value={formData.reviewed_by}
                  onChange={(e) => setFormData({...formData, reviewed_by: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed At</label>
                <input
                  type="date"
                  value={formData.reviewed_at}
                  onChange={(e) => setFormData({...formData, reviewed_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingId ? 'Update' : 'Create'} Rule Assertion
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrument</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No rule assertions found. Click "+ Add Rule" to create one, or import data from the Import/Export page.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.jurisdiction_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.instrument_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {rule.rule_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rule.age_min || rule.age_max ? (
                      `${rule.age_min || '?'} - ${rule.age_max || '?'}`
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                    {rule.requirement}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
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
