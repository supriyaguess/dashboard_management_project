import { useState } from 'react';
import toast from 'react-hot-toast';
import { reportsApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: '', endDate: '', city: '', status: '', service: '',
  });
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  // only include filters that actually have a value
  const getParams = (page = 1) => {
    const p = { page, limit: 20 };
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    if (filters.city) p.city = filters.city;
    if (filters.status) p.status = filters.status;
    if (filters.service) p.service = filters.service;
    return p;
  };

  const runSearch = async (page = 1) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await reportsApi.getFiltered(getParams(page));
      setLeads(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    reportsApi.exportXlsx(getParams());
    toast.success('Downloading...');
  };

  const exportCsv = () => {
    reportsApi.exportCsv(getParams());
    toast.success('Downloading...');
  };

  const clearAll = () => {
    setFilters({ startDate: '', endDate: '', city: '', status: '', service: '' });
    setLeads([]);
    setHasSearched(false);
  };

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Filter leads and export</p>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-800">Filter</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => updateFilter('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => updateFilter('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={filters.city}
              onChange={e => updateFilter('city', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Interested">Interested</option>
              <option value="Converted">Converted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="label">Service</label>
            <select
              value={filters.service}
              onChange={e => updateFilter('service', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="SEO">SEO</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Cloud Services">Cloud Services</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([k, v]) => (
              <span key={k} className="badge bg-blue-100 text-blue-700">
                {k}: {v}
                <button onClick={() => updateFilter(k, '')} className="ml-1.5 hover:text-blue-900">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button onClick={() => runSearch(1)} className="btn-primary">
            Search
          </button>
          {hasSearched && (
            <>
              <button onClick={exportExcel} className="btn-success">Export Excel</button>
              <button onClick={exportCsv} className="btn-secondary">Export CSV</button>
            </>
          )}
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="btn-secondary">Clear</button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && hasSearched && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <p className="font-medium text-gray-800">
              {pagination.total} result{pagination.total !== 1 ? 's' : ''}
            </p>
            {pagination.total > 0 && (
              <div className="flex gap-2">
                <button onClick={exportExcel} className="btn-success text-sm py-1.5">Excel</button>
                <button onClick={exportCsv} className="btn-secondary text-sm py-1.5">CSV</button>
              </div>
            )}
          </div>

          {leads.length === 0 ? (
            <p className="text-center py-14 text-gray-400">Nothing matched those filters</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Mobile</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">City</th>
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Budget</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.map(lead => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.mobile}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{lead.email}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.city}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.service}</td>
                        <td className="px-4 py-3 text-gray-600">₹{lead.budget?.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => runSearch(pagination.page - 1)}
                      className="btn-secondary text-sm"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => runSearch(pagination.page + 1)}
                      className="btn-secondary text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
