import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import interestRoutes from './routes/interests';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(limiter);

// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://6ixstack.github.io',
  'https://6ixstack.github.io/islamic-marriage-web-app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Emergency: Simplified CORS for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.get('origin') || 'no-origin'}`);
  next();
});

// Explicit OPTIONS handler for all routes
app.options('*', (req: Request, res: Response) => {
  console.log('⚙️ Handling OPTIONS request for:', req.path);
  res.status(204).end();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Muslim Marriage Referral Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});