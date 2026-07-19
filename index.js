/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import healthRouter from './server/routes/healthRoutes.js';
import authRouter from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import connectDB from './server/data/database.js';


const app = express();
const PORT = process.env.PORT || 3000;

// ====================== CORS CONFIG ======================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
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
app.get('/', (req, res) => {
    res.send("Up and Running~")
})

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);


app.listen(PORT, () => {
  console.log(`ScreenSage listening on port ${PORT}`);
});