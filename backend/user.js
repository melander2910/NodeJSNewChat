const bcrypt = require("bcrypt");

// The salt to be used in encryption. If specified as a number then a salt will be generated with the specified number of rounds and used.
// unique value that can be added to the end of the password to create a different hash value. This adds a layer of security to the hashing process, specifically against brute force attacks.
const saltRounds = 10;

const login = (app, connection) => {
    // app.get("/allusers",(req, res, next) => {
    //     // Select from mysql database and give rows as json result
    //     connection.query("SELECT username, alias FROM userLogin", (err, rows, fields) => {
    //         console.log("Succesfully fetched all users");
    //         res.json(rows);
    //     })
    // })

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