// ============================================================================
// LERNAL LMS - BACKEND REST API SERVER (Render-Ready)
// Tagline: SINCE 2026
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import videosRoutes from './routes/videos.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import financeRoutes from './routes/finance.routes.js';
import testsRoutes from './routes/tests.routes.js';
import studentRoutes from './routes/student.routes.js';
import parentRoutes from './routes/parent.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(
  cors({
    origin: '*', // Allow Vercel frontend domain or local dev
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Health Check Endpoint (Render Health Check)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Lernal LMS API Engine',
    version: '1.0.0',
    tagline: 'SINCE 2026',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    architecture: {
      frontend: 'Vercel',
      backend: 'Render',
      database: 'Supabase PostgreSQL',
      streaming: 'Bunny.net Stream CDN',
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Lernal Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    service: 'Lernal Backend',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 LERNAL LMS API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`✨ Tagline: SINCE 2026`);
  console.log(`🎯 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
