/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

console.log("Starting minimal server...");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Root route works" });
});

app.get('/test', (req, res) => {
    res.json({ message: "Test route works" });
});

app.post('/api/v1/auth/login', (req, res) => {
    res.json({ message: "Login route works", body: req.body });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});