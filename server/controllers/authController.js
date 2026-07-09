/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Checks if there is content in the username, email, and password fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        // Checks if the email is already registered in the database
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        // Checks if username is already taken in the database
        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        // Hash the password before saving it to the database 
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create a new user instance with the hashed password
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user: ", error.message);
        res.status(500).json({ message: "Registration failed. Internal server error." });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        //Check if the user exists
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        //Check if the password matches
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid login credentials"});
        }

        // Create a JWT token for authenticated user
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            secretKey,
            {expiresIn: "10h"}
        );

        // Send the token in the response
        res.status(200).json({
            message: "Login successful", 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error logging in user: ", error.message);
        res.status(500).json({ message: "Login failed. Internal server error." });
    }
}