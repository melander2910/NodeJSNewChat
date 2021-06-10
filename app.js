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

// import express-session
const session = require("express-session")

// in order for the app to use sessions
app.use(session({
    secret: "secret session cookie is signed with this secret to prevent tampering", // Data tampering is the act of deliberately modifying (destroying, manipulating, or editing) data through unauthorized channels
    resave: false,
    saveUninitialized: false
}))

// import mysql
const mysql = require("mysql");

// connection information for a specific database
const connection = mysql.createConnection({
    host: "kealoungedb.censevy2cldg.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "KeaLoungeDB"
});

// connecting to the database
connection.connect((error) => {
    if(error){
        console.log("Could not connect to the database: " + error);
    } else {
        console.log("Succefully connected to the database");
    }
})

// import functions and constants from user.js
const { 
    login 
} = require("./backend/user");

// using login from user.js in order to create a user and check credentials upon login attempt
login(app, connection)

// import file-system
const fs = require("fs");

// express creates an http server for you, but if you want to reuse the http server 
// to run sockets, then create your own http server

// Socket.IO is composed of two parts:

// A server that integrates with (or mounts on) the Node.JS HTTP Server socket.io
const http = require('http');

const server = http.createServer(app);

// and a client library that loads on the browser side socket.io-client
const io = require("socket.io")(server);

// creating a variable in order to save user.session data
let user = null;

// run when client connects
io.on("connection", (socket) => {

    // when a user joins the chat give that user a welcome message
    socket.emit("message", "Welcome to the chat, have fun!")
    
    // when a user joins the chat give everyone a message
    socket.broadcast.emit("message", `${"user.username"} has joined the chat` )

    // when a user leaves the chat give everyone a message
    socket.on("disconnect", () => {
        io.emit("message", "A user disconnected from the chat")
    });

    // when a user sends a chat message, emit chat message to all users
    socket.on("chatMessage", (chatMessage) => {
        io.emit("message", chatMessage);
    });
});


// not sure why this is smart? SSR? questionmark
const chatpage = fs.readFileSync(__dirname + "/public/chat.html", "utf-8");
const loginpage = fs.readFileSync(__dirname + "/public/login.html", "utf-8");
const signuppage = fs.readFileSync(__dirname + "/public/signup.html", "utf-8");

// Serving html pages
app.get("/chat", (req, res) => {
    if(req.session.isAuth){   
        user = req.session.user;        
        res.send(chatpage)
    } else {
        res.send(loginpage)
    }
})

app.get("/", (req, res) => {
    res.send(loginpage)
})

app.get("/signup", (req, res) => {
    res.send(signuppage)
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