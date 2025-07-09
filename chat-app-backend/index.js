import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as socketIo } from 'socket.io';
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./config/db.js";
import Message from './models/Message.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
    cors: {
        origin: "https://chat-app-puce-one.vercel.app",
        methods: ["GET", "POST"]
    }
})

app.use(cors({
  origin: "https://chat-app-puce-one.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// This line below allows preflight (OPTIONS) to work too:
app.options("*", cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running.")
})

io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on('typing', ({ senderId, receiverId }) => {
        io.to(receiverId).emit('typing', { senderId });
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
        io.to(receiverId).emit('stop_typing', { senderId });
    });

    socket.on('join', (userId) => {
        if (!userId) return;
        socket.join(userId);
        socket.userId = userId;
        console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on('send_message', async ({ senderId, receiverId, text }) => {
        console.log("Received message:", { senderId, receiverId, text });

        if (!senderId || !receiverId || !text) {
            console.log("Missing fields in message");
            return;
        }

        try {
            const newMessage = await Message.create({
                sender: senderId,
                receiver: receiverId,
                text,
            });

            io.to(receiverId).emit('receive_message', newMessage);
        } catch (error) {
            console.error('Error saving message:', error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id)
    })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`))

