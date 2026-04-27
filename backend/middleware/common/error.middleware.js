/**
 * Global Error Handling Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', details: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = req.path === '/upload'
      ? 'Maximum image size allowed is 5 MB'
      : 'Maximum video size allowed is 25 MB';
    return res.status(413).json({ error: message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found', 
    hint: 'Try GET /api for available endpoints' 
  });
};

module.exports = {
  errorMiddleware,
  notFoundHandler,
};
