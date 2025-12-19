import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// API routes will go here
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to ITKit API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;