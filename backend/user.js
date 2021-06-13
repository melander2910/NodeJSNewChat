const session = require("express-session");

const login = (app, connection) => {
    // creating a user
    app.post("/signup", (req, res) => {
        const data = req.body
        connection.query("INSERT INTO userLogin SET ?", data, (rows, fields) => {
            console.log("Created User: " + data.username + " With Alias: " + data.alias);
        });
        res.redirect("/")
    }); 

    // checking login credentials
    app.post("/", (req, res) => {
        const data = req.body
        
        console.log(data.username + " AND " + data.password);
        connection.query("SELECT * FROM userLogin where username = ? and password = ?", [data.username, data.password], (fields, rows) => {
            if(rows.length > 0){
                let user = rows[0];
                user.room = data.room;
                console.log(data.room);
                req.session.isAuth = true;
                req.session.user = user;
                res.redirect("/chat");
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
    const user = { id, username, room };
    userlist.push(user);
    return user;
}

// User leaves chat
function userLeave(id) {
    const index = userlist.findIndex(user => user.id == id);
    if(index != -1) {
        return userlist.splice(index, 1)[0];
    }
}

// creating a function to get roomusers of a specific room
function getRoomUsers(room) {
    return userlist.filter(user => user.room === room);
}

// exporting functions and constants
module.exports = {
    login,
    userJoin,
    getRoomUsers,
    userLeave
}