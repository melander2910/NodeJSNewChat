// import express
const express = require("express");

// instantiate express
const app = express();

// give access to the 'public' folder
app.use(express.static('public'));

// used to set environmental variables in order to store private information such as database connection credentials
const dotenv = require("dotenv");
dotenv.config({
    path: "./.env"
})

// recognize req objects as JSON text
app.use(express.json());

// recoqnize req objects as string or arrays
app.use(express.urlencoded({
    extended: true
}));

// import file-system
const fs = require("fs");

// express creates an http server for you, but if you want to reuse the http server 
// to run sockets, then create your own http server

// Socket.IO is composed of two parts:

// A server that integrates with (or mounts on) the Node.JS HTTP Server socket.io
const http = require('http');
const server = http.createServer(app);

// A client library that loads on the browser side socket.io-client
const io = require("socket.io")(server);

// Log when a user connects to the server 
io.on("connection", (socket) => {

    console.log("A user connected to the server");
    
    // log when a user disconnects from the server
    socket.on("disconnect", () => {
        console.log("A user disconnected from the server");
    });

    socket.on("chatMessage", (chatMessage) => {
        io.emit("chatMessage", chatMessage)
        console.log(chatMessage);
    });
});




// const frontpage = __dirname + "/public/index.html";
// 
const frontpage = fs.readFileSync(__dirname + "/public/index.html", "utf-8");

// Serving html pages
app.get("/", (req, res) => {
    res.sendFile(frontpage)
})

// setting port to .env port if it exist, else 3000
const PORT = process.env.PORT || 3000;

// listen on a port in order for the app to run
server.listen(PORT, (error) => {
    if(error){
        console.log("Something bad happened: " + error);
    } else {
        console.log("Server is running on port", PORT);
    }
})