import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { leadsApi } from '../api';
import Modal from '../components/Modal';
import LeadForm from '../components/LeadForm';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      const res = await leadsApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setLeads(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [search, statusFilter]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingLead?._id) {
        await leadsApi.update(editingLead._id, formData);
        toast.success('Lead updated');
      } else {
        await leadsApi.create(formData);
        toast.success('Lead added');
      }
      closeModal();
      fetchLeads(1);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await leadsApi.delete(deleteId);
      toast.success('Deleted');
      setDeleteId(null);
      fetchLeads(pagination.page);
    } catch {
      toast.error('Delete failed');
    }
  };

  const openAdd = () => {
    setEditingLead(null);
    setShowModal(true);
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">{pagination.total} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add Lead
        </button>
      </div>

      {/* search & filter */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search name, email or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
            <option value="Rejected">Rejected</option>
          </select>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No leads found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new lead</p>
          </div>
        ) : (
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
                  <th className="px-4 py-3 text-left">Added</th>
                  <th className="px-4 py-3 text-left"></th>
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
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(lead)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(lead._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchLeads(pagination.page - 1)}
                className="btn-secondary text-sm"
              >
                Prev
              </button>
              <span className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchLeads(pagination.page + 1)}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingLead ? 'Edit Lead' : 'New Lead'}
        size="lg"
      >
        <LeadForm
          initial={editingLead}
          onSubmit={handleSave}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete lead?" size="sm">
        <p className="text-gray-600 mb-6">This can't be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="btn-danger flex-1">Yes, delete</button>
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
