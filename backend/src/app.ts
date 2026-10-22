import express from 'express';
import { config } from './config.js';
import { getDBStatus, connectDB } from './db.js';
import productRouter from './routes/productRoutes.js';
import authRouter from './routes/authRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import cartRouter from './routes/cartRoutes.js';

export const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) {
    next();
    return;
  }

  let sameHost = false;
  try {
    sameHost = new URL(origin).host === req.get('host');
  } catch {
    res.sendStatus(403);
    return;
  }

  if (!sameHost && !config.corsOrigins.includes(origin)) {
    res.sendStatus(403);
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,X-Order-Access-Token');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health route DB ke bina bhi chalega (isliye DB middleware se pehle)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'VELORA Contemporary Fashion API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: getDBStatus(),
  });
});

// Har API request se pehle DB connect karo (cached, serverless-safe)
app.use(async (_req, res, next) => {
  const connected = await connectDB();
  if (!connected) {
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);

export default app;