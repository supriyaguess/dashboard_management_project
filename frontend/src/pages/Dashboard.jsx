import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

// colors for status badges/charts
const STATUS_COLORS = {
  New: '#3b82f6',
  Interested: '#f59e0b',
  Converted: '#10b981',
  Rejected: '#ef4444',
};

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-500 mb-3">{error}</p>
        <button onClick={fetchStats} className="btn-primary">Try again</button>
      </div>
    );
  }

  if (!stats) return null;

  const converted = stats.statusBreakdown.find(s => s.status === 'Converted')?.count ?? 0;
  const interested = stats.statusBreakdown.find(s => s.status === 'Interested')?.count ?? 0;
  const rejected = stats.statusBreakdown.find(s => s.status === 'Rejected')?.count ?? 0;

  const pieData = stats.statusBreakdown.map(s => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Lead metrics at a glance</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.totalLeads} icon="👥" color="blue" />
        <StatCard
          title="Converted"
          value={converted}
          icon="✅"
          color="green"
          subtitle={`${stats.conversionRate}% conversion rate`}
        />
        <StatCard title="Interested" value={interested} icon="⭐" color="yellow" subtitle="warm leads" />
        <StatCard title="Rejected" value={rejected} icon="❌" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* status pie */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Status Breakdown</h3>
          {pieData.every(d => d.value === 0) ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, 'Leads']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* monthly line */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Trend</h3>
          {!stats.monthlyTrend?.length ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm">
                        <p className="font-medium text-gray-700">{label}</p>
                        <p className="text-blue-600">{payload[0].value} leads</p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Leads"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* cities */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Leads by City</h3>
          {!stats.cityDistribution?.length ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.cityDistribution}
                margin={{ top: 5, right: 20, bottom: 40, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [v, 'Leads']} />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {stats.cityDistribution.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* services */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Leads by Service</h3>
          {!stats.serviceDistribution?.length ? (
            <p className="text-center text-gray-400 py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.serviceDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="service" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={v => [v, 'Leads']} />
                <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                  {stats.serviceDistribution.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* quick status summary */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Status Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.statusBreakdown.map(({ status, count }) => (
            <div
              key={status}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: STATUS_COLORS[status] + '18' }}
            >
              <p className="text-3xl font-bold" style={{ color: STATUS_COLORS[status] }}>
                {count}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">{status}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {stats.totalLeads > 0
                  ? ((count / stats.totalLeads) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
