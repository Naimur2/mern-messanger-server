const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');
const turnServer = require('./config/turn-server');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));
app.use(cors());

app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
})
app.use("/user", require("./routes/user-route"));

const port = process.env.PORT || 4000;


const server = http.createServer(app);



const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,

    }
});



// server-side
io.on("connection", (socket) => {
    console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
    socket.on("message", (message) => {
        console.log(message);
        // io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("disconnect");
    });
});


const newServer = app.listen(7001, () => {
    console.log(`Server is running on port ${port}`);
});

const peerServer = ExpressPeerServer(newServer, {
    path: '/',
    debug: true,
    secure: false,
});

peerServer.on('connection', (client) => {
    console.log('Client connected', client.id);

});

peerServer.on('disconnect', (client) => {
    console.log('Client disconnected', client.id);
});

app.use('/peer', peerServer);

turnServer.start();

server.listen(port, () =>
    console.log(`Server is running on port ${port}`)
);