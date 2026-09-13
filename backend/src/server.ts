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

import { isSupabaseConfigured } from './services/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
const configuredFrontend = process.env.FRONTEND_URL?.trim();
const allowedOrigins = configuredFrontend
  ? configuredFrontend.split(',').map((u) => u.trim().replace(/\/+$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Render health checks, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In development or if FRONTEND_URL is not configured, allow all origins
      if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      // Check configured frontend URLs, localhost, or Vercel preview URLs (*.vercel.app)
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.use(express.json());

// Standard Health Status Payload
const getHealthStatus = () => ({
  status: 'ok',
  service: 'Lernal LMS API Engine',
  version: '1.0.0',
  tagline: 'SINCE 2026',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  database: isSupabaseConfigured() ? 'connected' : 'unconfigured',
  architecture: {
    frontend: 'Vercel',
    backend: 'Render',
    database: 'Supabase PostgreSQL',
    streaming: 'Bunny.net Stream CDN',
  },
});

// Root Service Discovery
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Lernal LMS REST API Engine',
    tagline: 'SINCE 2026',
    status: 'ok',
    health: '/health',
    version: '1.0.0',
    documentation: 'https://github.com/eslamssalah2014-bit/lernal-lms',
  });
});

// Health Check Endpoint (Standard Render Health Check: GET /health)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json(getHealthStatus());
});

// Alternate Health Check Endpoint (GET /api/health)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json(getHealthStatus());
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
  console.log(`🎯 Health Check: /health & /api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

export default app;
