/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project

import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        //Hash the password before saving it to the database 
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        //Create a new user instance with the hashed password
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        //Save the new user to the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Registration failed" });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Find user by email
        const user = await User.find(email);

        //Check if the user exists
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        //Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        //Check if the password matches
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid login credentials"})
        }

        //Create a JWT token for authenticated user
        const token = jwt.sign({userId: user._id}, secretKey, {expiresIn: "1h"});

        //Send the token in the response
        res.status(200).json({message: "Login successful", token});
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Login failed" });
    }
}