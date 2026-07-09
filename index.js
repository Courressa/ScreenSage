/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import healthRouter from './server/routes/healthRoutes.js';
import authRouter from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import connectDB from './server/data/database.js';
import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

//Connect to MongoDB
await connectDB();

//Middleware to parse JSON request bodies and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRoutes);


app.listen(PORT, () => {
  console.log(`ScreenSage listening on port ${PORT}`);
});