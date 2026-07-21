import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json(
            users.map((user) => ({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            }))
        );
    } catch (error) {
        console.error("Error fetching users: ", error.message);
        res.status(500).json({ message: "Failed to fetch users. Internal server error." });
    }
};
