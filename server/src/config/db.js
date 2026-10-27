import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from 'mongoose';
export async function connectDB(){await mongoose.connect(process.env.MONGODB_URI);console.log('MongoDB connected');}
