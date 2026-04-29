import { useState, useEffect } from 'react';

const SERVICES = [
  'Web Development',
  'Mobile App',
  'SEO',
  'Digital Marketing',
  'UI/UX Design',
  'Cloud Services',
  'Consulting',
  'Other',
];

const defaultForm = {
  name: '',
  mobile: '',
  email: '',
  city: '',
  service: '',
  budget: '',
  status: 'New',
  notes: '',
};

const statusColors = {
  New: 'bg-blue-100 text-blue-700 border-blue-300',
  Interested: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Converted: 'bg-green-100 text-green-700 border-green-300',
  Rejected: 'bg-red-100 text-red-700 border-red-300',
};

export default function LeadForm({ initial, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setFormData({ ...defaultForm, ...initial, budget: initial.budget ?? '' });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [initial]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter a name';
    if (!formData.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'That doesn\'t look like a valid email';
    }
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.service) errs.service = 'Please select a service';
    if (formData.budget === '' || isNaN(formData.budget)) errs.budget = 'Enter a valid budget amount';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({ ...formData, budget: Number(formData.budget) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Rahul Sharma"
            className={`input ${errors.name ? 'border-red-400' : ''}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Mobile *</label>
          <input
            type="text"
            value={formData.mobile}
            onChange={e => handleChange('mobile', e.target.value)}
            placeholder="+91 98765 43210"
            className={`input ${errors.mobile ? 'border-red-400' : ''}`}
          />
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="rahul@example.com"
            className={`input ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="label">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={e => handleChange('city', e.target.value)}
            placeholder="Mumbai"
            className={`input ${errors.city ? 'border-red-400' : ''}`}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Service *</label>
          <select
            value={formData.service}
            onChange={e => handleChange('service', e.target.value)}
            className={`input ${errors.service ? 'border-red-400' : ''}`}
          >
            <option value="">Select...</option>
            {SERVICES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
        </div>

        <div>
          <label className="label">Budget (₹) *</label>
          <input
            type="number"
            value={formData.budget}
            onChange={e => handleChange('budget', e.target.value)}
            placeholder="50000"
            min="0"
            className={`input ${errors.budget ? 'border-red-400' : ''}`}
          />
          {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
        </div>
      </div>

      <div>
        <label className="label">Status</label>
        <div className="flex gap-2 flex-wrap">
          {['New', 'Interested', 'Converted', 'Rejected'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleChange('status', s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                formData.status === s
                  ? statusColors[s]
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Any additional info..."
          rows={3}
          className="input resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : initial?._id ? 'Update' : 'Add Lead'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
