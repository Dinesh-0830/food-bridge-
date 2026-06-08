import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Standard middlewares
app.use(cors({
  origin: '*', // Allow all in local dev/demo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Support larger base64 file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount all API routes
app.use('/api', routes);

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the FoodBridge API Service!' });
});

// 404 Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error occurred:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;
