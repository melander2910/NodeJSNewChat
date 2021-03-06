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
app.use(session({               // "secret session cookie is signed to prevent tampering"
    secret: process.env.SECRET, // Data tampering is the act of deliberately modifying (destroying, manipulating, or editing) data through unauthorized channels
    resave: false,
    saveUninitialized: false 
}))

// import mysql
const mysql = require("mysql");

// connection information for a specific database (can do an if node_env = development or production, use different databases)
const connection = mysql.createConnection({
    host: "kealoungedb.censevy2cldg.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "KeaLoungeDB"
});

// connecting to the database
connection.connect((error) => {
    if (error) {
        console.log("Could not connect to the database: " + error);
    } else {
        console.log("Succefully connected to the database");
    }
})

// import message format function
const formatter = require("./backend/messageFormat")

// import functions and constants from user.js
const {
    login,
    userJoin,
    getRoomUsers,
    userLeave
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

    socket.on("joinRoom", ({
        username = user.alias,
        room = user.room
    }) => {

        // adding user to a list
        const user = userJoin(socket.id, username, room)

        // join room
        socket.join(room)

        // emitting room users of joined room
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        // when a user joins the chat give that user a welcome message
        socket.emit("message", formatter("Chatbot", `Welcome to ${room}, ${username}`))

        // when a user joins the chat give everyone a message
        socket.broadcast.to(room).emit("message", formatter("Chatbot", `${username} has joined ${room}`))

        // when a user leaves the chat give everyone a message
        socket.on("disconnect", () => {
            const user = userLeave(socket.id)

            if (user) {
                io.to(room).emit("message", formatter("Chatbot", `${username} has disconnected from the chat`))

                // update userlist
                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });

        // Change room
        socket.on("roomChange", (value) => {

            // leave the room
            socket.leave(room)

            // tell the room the user left, that he/she left it
            let user = userLeave(socket.id)
            if (user) {
                io.to(room).emit("message", formatter("Chatbot", `${username} has disconnected from the chat`))

                // update userlist in the room the user left
                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }

            // set room to be the value of the selecter
            room = value

            // adding user to a new userlist
            user = userJoin(socket.id, username, room)

            // join the new room
            socket.join(room)

            // give welcome message to joined user
            socket.emit("message", formatter("Chatbot", `Welcome to ${room}, ${username}`))

            // emitting room users of the new joined room
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });

            // give everyone a message about the new user entering the chat
            socket.broadcast.to(room).emit("message", formatter("Chatbot", `${username} has joined ${room}`))
        })

        // when a user sends a chat message, emit chat message to all users
        socket.on("chatMessage", (chatMessage) => {
            io.to(room).emit("message", formatter(username, chatMessage));
        });

    });
});


// 
const chatpage = fs.readFileSync(__dirname + "/public/chat.html", "utf-8");
const loginpage = fs.readFileSync(__dirname + "/public/login.html", "utf-8");
const signuppage = fs.readFileSync(__dirname + "/public/signup.html", "utf-8");

// Serving html pages
app.get("/chat", (req, res) => {
    if (req.session.isAuth) {
        user = req.session.user;
        res.send(chatpage)
    } else {
        res.send(loginpage)
    }
})

app.get("/", (req, res) => {
    if (req.session.isAuth) {
        user = req.session.user;
        res.send(chatpage)
    } else {
        res.send(loginpage)
    }
})

app.get("/signup", (req, res) => {
    res.send(signuppage)
})

app.get("/logout", (req, res) => {
    req.session.isAuth = false
    res.send(loginpage)
})

// setting port to .env port if it exist, else 3000
const PORT = process.env.PORT || 3000;

// listen on a port in order for the app to run
server.listen(PORT, (error) => {
    if (error) {
        console.log("Something bad happened: " + error);
    } else {
        console.log("Server is running on port", PORT);
    }
})