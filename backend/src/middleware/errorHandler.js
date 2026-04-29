const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProd && !err.status ? 'Internal server error' : err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
