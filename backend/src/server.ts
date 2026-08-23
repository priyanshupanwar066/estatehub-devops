import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import { seedProperties } from './config/seed.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables from root or localc
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Connect to MongoDB
  await connectDB();

  // Seed property listings if needed
  await seedProperties();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // K8s Liveness Probe
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // K8s Readiness Probe
  app.get('/ready', (req, res) => {
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({ status: 'ready', db: 'connected' });
    } else {
      res.status(503).json({ status: 'not ready', db: 'disconnected' });
    }
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/inquiries', inquiryRoutes);

if (process.env.NODE_ENV !== 'production') {
  console.log('Starting server in DEVELOPMENT mode with Vite middleware...');

  const { createServer: createViteServer } = await import('vite');

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
} else {
  console.log('Starting server in PRODUCTION mode...');
}

  // Centralized Error Handler (must be registered last)
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EstateHub server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
