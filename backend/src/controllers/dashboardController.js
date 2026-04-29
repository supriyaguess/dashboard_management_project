const Lead = require('../models/Lead');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalLeads,
      statusBreakdown,
      cityDistribution,
      serviceDistribution,
      monthlyTrend,
    ] = await Promise.all([
      Lead.countDocuments(),

      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Lead.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Lead.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Lead.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const statusMap = { New: 0, Interested: 0, Converted: 0, Rejected: 0 };
    statusBreakdown.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyTrend.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    }));

    res.json({
      success: true,
      data: {
        totalLeads,
        statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        cityDistribution: cityDistribution.map((c) => ({ city: c._id, count: c.count })),
        serviceDistribution: serviceDistribution.map((s) => ({ service: s._id, count: s.count })),
        monthlyTrend: formattedMonthly,
        conversionRate: totalLeads > 0 ? ((statusMap.Converted / totalLeads) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
