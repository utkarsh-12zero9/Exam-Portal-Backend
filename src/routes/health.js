import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    message: 'Exam Portal API is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // seconds
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      host: mongoose.connection.host || 'N/A',
    },
  });
});

export default router;
