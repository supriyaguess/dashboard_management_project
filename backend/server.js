require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_dashboard';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to mongo');
    app.listen(PORT, () => console.log(`server up on :${PORT}`));
  })
  .catch(err => {
    console.error('mongo connection failed:', err.message);
    process.exit(1);
  });
