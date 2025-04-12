// Import the payment routes
const paymentRoute = require('./routes/paymentRoute');

// ... existing routes and middleware ...

// Add payment routes
app.use('/api/payment', paymentRoute);

// ... rest of the existing code ... 