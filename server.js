const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')));

// Health check route - also used by tests and monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'PetPal' });
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