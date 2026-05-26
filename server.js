import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';

// Load environment variables first
dotenv.config();

// Establish MongoDB connection
connectDB();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in [${NODE_ENV}] mode on port: ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
  process.exit(1);
});
