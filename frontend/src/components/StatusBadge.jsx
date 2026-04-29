const config = {
  New: 'bg-blue-100 text-blue-700',
  Interested: 'bg-yellow-100 text-yellow-700',
  Converted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${config[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
