const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 4500;

const users = {}; // Use an object to map socket IDs to user names

app.use(cors());
app.get("/", (req, res) => {
    res.send("HELL ITS WORKING");
});

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user; // Store user name with socket ID
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${users[socket.id]}` });
    });

    socket.on('message', ({ message }) => {
        // Use socket.id to get the current user's ID
        const id = socket.id;
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
        console.log(`User left`);
        delete users[socket.id]; // Clean up user data on disconnect
    });
});

server.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
});
