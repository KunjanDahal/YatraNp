const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    
    // Use more robust connection options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout
      socketTimeoutMS: 45000,
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      maxPoolSize: 50,
      retryWrites: true,
      maxIdleTimeMS: 10000,
      waitQueueTimeoutMS: 10000
    });
    
    console.log(`MongoDB connected: ${conn.connection.host} 😎`);

    // Set up error handling for the connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully!');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Don't exit the process, just log the error and return
    console.error("Will retry MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    return null;
  }
};

module.exports = connectDB;
