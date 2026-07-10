/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import healthRouter from './server/routes/healthRoutes.js';
import authRouter from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import connectDB from './server/data/database.js';
import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Connect to MongoDB
await connectDB();

//Middleware to parse JSON request bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRoutes);

//Catch-all route to serve index.html for React Router
app.get(/\/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ScreenSage listening on port ${PORT}`);
});