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



module.exports = {
    login,
}