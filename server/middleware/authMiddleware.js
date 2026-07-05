/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET;

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        // Check if the Authorization header is present and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Authentication token is required" });
        }

        // Extract the token from Bearer token in the Authorization header
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Authentication token is required" });
        }

        const decodedToken = jwt.verify(token, secretKey);

        req.userData = {
            userId: decodedToken.userId, 
            email: decodedToken.email,
            role: decodedToken.role
        };

        next();
    } catch (error) {
        console.error("Authentication error: ", error.message);
        res.status(401).json({ message: "Unauthorized" });
    }
}