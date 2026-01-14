import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import articleRoutes from './routes/article';
import categoryRoutes from './routes/categories';
import feedbackRoutes from './routes/feedback';
import searchRoutes from './routes/search';


// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'ITKit Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to ITKit API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      articles: '/api/articles',
      categories: '/api/categories',
      feedback: '/api/feedback',
      search: '/api/search', 
    }
  });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/feedback', feedbackRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

export default app;