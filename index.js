/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import healthRouter from './server/routes/healthRoutes.js';
import authRouter from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import paymentRoutes from './server/routes/paymentRoutes.js';
import connectDB from './server/data/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const distIndex = path.join(distPath, 'index.html');

const app = express();
const PORT = process.env.PORT || 3000;

// ====================== CORS CONFIG ======================
// Same-origin on Render needs no special origin. ALLOWED_ORIGINS is for local Vite
// and any extra frontends.
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, mobile apps, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// =======================================================

//Connect to MongoDB
await connectDB();

//Middleware to parse JSON request bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    abortOnLimit: true
}));

// ====================== API routes ======================
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);

// ====================== Frontend (Vite build) ======================
// Production: serve React from /dist after `npm run build` on Render.
// Local: API only unless you have run a build (use Vite on :5173 for UI).
if (fs.existsSync(distIndex)) {
    app.use(express.static(distPath));

    // SPA fallback: non-API routes → index.html (React Router)
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API route not found.' });
        }
        res.sendFile(distIndex, (err) => {
            if (err) next(err);
        });
    });
} else {
    app.get('/', (_req, res) => {
        res
            .status(200)
            .type('text')
            .send(
                'ScreenSage API is running. Frontend build not found (dist/ missing). ' +
                'On Render, set Build Command to: npm install && npm run build'
            );
    });
}

app.listen(PORT, () => {
  console.log(`ScreenSage listening on port ${PORT}`);
  if (fs.existsSync(distIndex)) {
    console.log(`Serving frontend from ${distPath}`);
  } else {
    console.log('No dist/ build found — API only until you run npm run build');
  }
});
