const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Implement rate limiting to prevent abuse of the API
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware setup
const setupMiddleware = (app) => {
  app.use(bodyParser.json({ type: 'application/json', limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ type: 'application/json; charset=utf-8' }));

  // Handle charset issues
  app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('charset=UTF-8')) {
      req.headers['content-type'] = req.headers['content-type'].replace(/;\s*charset=UTF-8/, '');
    }
    next();
  });

  // Fallback for unsupported charsets
  app.use((err, req, res, next) => {
    if (err.type === 'charset.unsupported') {
      res.status(415).send({ error: 'Unsupported charset' });
    } else {
      next(err);
    }
  });

  app.use(cors());
  app.use(apiRateLimiter);
  app.use(express.static(path.join(__dirname, '../../frontend')));

  // Handle unhandled errors
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });
};

module.exports = setupMiddleware;