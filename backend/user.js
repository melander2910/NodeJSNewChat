const session = require("express-session");


const bcrypt = require("bcrypt");

// 10 hashes pr second
const saltRounds = 10;

const login = (app, connection) => {
    // creating a user
    app.post("/signup", (req, res) => {
        const data = req.body

        bcrypt.hash(data.password, saltRounds, (error, hash) => {
            connection.query("INSERT INTO userLogin (username, password, alias) VALUES (?, ?, ?)", [data.username, hash, data.alias], (rows, fields) => {
            });
        })

        res.redirect("/")
    });

    // checking login credentials
    app.post("/", (req, res) => {
        const data = req.body
        connection.query("SELECT * FROM userLogin where username = ?", [data.username], (fields, rows, hash) => {
            if (rows.length > 0) {

                // compare req password with hashed password in DB by using bcrypt compare function
                bcrypt.compare(data.password, rows[0].password, (err, result) => {
                    if (result) {
                        let user = rows[0];
                        user.room = data.room;
                        req.session.isAuth = true;
                        req.session.user = user;
                        res.redirect("/chat");
                    } else {
                        res.redirect("/");
                    }
                });
                
            } else {
                res.redirect("/");
            }
        });
    });
}

// creating a list in which i can add users
let userlist = [];

// creating a function to add users to the list
function userJoin(id, username, room) {
    const user = {
        id,
        username,
        room
    };
    userlist.push(user);
    return user;
}

// User leaves chat
function userLeave(id) {
    const index = userlist.findIndex(user => user.id == id);
    if (index != -1) {
        return userlist.splice(index, 1)[0];
    }
}

// creating a function to get roomusers of a specific room
function getRoomUsers(room) {
    return userlist.filter(user => user.room == room);
}

// exporting functions and constants
module.exports = {
    login,
    userJoin,
    getRoomUsers,
    userLeave
}