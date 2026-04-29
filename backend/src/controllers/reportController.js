const Lead = require('../models/Lead');
const XLSX = require('xlsx');

const getFilteredReports = async (req, res) => {
  try {
    const { startDate, endDate, city, status, service, page = 1, limit = 20 } = req.query;
    const filter = buildFilter({ startDate, endDate, city, status, service });

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, city, status, service } = req.query;
    const filter = buildFilter({ startDate, endDate, city, status, service });
    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();

    const rows = leads.map((l) => ({
      Name: l.name,
      Mobile: l.mobile,
      Email: l.email,
      City: l.city,
      Service: l.service,
      Budget: l.budget,
      Status: l.status,
      Notes: l.notes || '',
      'Created At': new Date(l.createdAt).toLocaleDateString(),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=leads_report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const exportCSVFormat = async (req, res) => {
  try {
    const { startDate, endDate, city, status, service } = req.query;
    const filter = buildFilter({ startDate, endDate, city, status, service });
    const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();

    const headers = ['Name', 'Mobile', 'Email', 'City', 'Service', 'Budget', 'Status', 'Notes', 'Created At'];
    const rows = leads.map((l) => [
      l.name, l.mobile, l.email, l.city, l.service,
      l.budget, l.status, l.notes || '',
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename=leads_report.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function buildFilter({ startDate, endDate, city, status, service }) {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (status) filter.status = status;
  if (service) filter.service = { $regex: service, $options: 'i' };
  return filter;
}

module.exports = { getFilteredReports, exportCSV, exportCSVFormat };
