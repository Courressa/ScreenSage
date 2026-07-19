/* global process */ //This is for process.env to avoid red squiggly lines in VS Code and let it know this is a Node.js project


import dns from "dns";
import mongoose from "mongoose";

// Node on this machine resolves DNS via 127.0.0.1, which refuses SRV queries
// required by mongodb+srv://. Prefer public resolvers for Atlas lookups.
const localDnsOnly =
    dns.getServers().length > 0 &&
    dns.getServers().every((server) => server === "127.0.0.1" || server === "::1");

if (localDnsOnly) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};