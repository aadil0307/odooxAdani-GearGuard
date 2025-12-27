import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { logger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/constants';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GearGuard API',
    version: config.apiVersion,
    documentation: `/api/${config.apiVersion}/health`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 GearGuard Backend Server Started');
  console.log('=====================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📦 API Version: ${config.apiVersion}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${config.apiVersion}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/${config.apiVersion}/health`);
  console.log('=====================================');
  console.log('');
});

export default app;
