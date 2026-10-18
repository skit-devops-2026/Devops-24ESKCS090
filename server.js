
const promClient = require('@prometheus-io/client');
const register = new promClient.Registry();

promClient.collectDefaultMetrics({
  register,
  prefix: 'petpal_'
});

const httpRequests = new promClient.Counter({
  name: 'petpal_http_requests_total',
  help: 'Total HTTP requests to PetPal',
  labelNames: ['method', 'status_code'],
  registers: [register]
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequests.inc({
        method: req.method,
        status_code: String(res.statusCode)
      });
    }
  });
  next();
});


app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')));

// Health check route - also used by tests and monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'PetPal' });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (error) {
    res.status(500).send('Metrics unavailable');
  }
});

// Root route
app.get('/', (req, res) => {
  res.status(200).send('PetPal server is running');
});

// Only start listening if this file is run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PetPal server running on port ${PORT}`);
  });
}

module.exports = app;