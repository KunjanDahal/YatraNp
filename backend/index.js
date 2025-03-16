// Import the payment routes
const paymentRoutes = require('./routes/paymentRoutes');

// ... existing routes and middleware ...

// Add payment routes
app.use('/api/payments', paymentRoutes);

// ... rest of the existing code ... 