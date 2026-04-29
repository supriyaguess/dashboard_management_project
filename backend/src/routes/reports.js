const express = require('express');
const router = express.Router();
const { getFilteredReports, exportCSV, exportCSVFormat } = require('../controllers/reportController');

router.get('/', getFilteredReports);
router.get('/export/xlsx', exportCSV);
router.get('/export/csv', exportCSVFormat);

module.exports = router;
