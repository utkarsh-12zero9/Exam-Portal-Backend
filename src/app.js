import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoute from './routes/health.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

const app = express();

// Global Middlewares
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development mode
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Routes registration
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Root index fallback route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Online Exam Portal REST API. Please use /api/health to check API status.',
  });
});

// 404 - Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'API Endpoint Not Found',
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack || err.message);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

export default app;