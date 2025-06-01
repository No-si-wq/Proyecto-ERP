const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/reports', require('./routes/report.routes'));

module.exports = app;