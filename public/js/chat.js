// Client side

const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const allMessages = document.getElementById("messages");

// emitting join room when a user navigates to /chat - can only happend upon login
socket.emit("joinRoom", () => { 

});

// Listen for messages from client side
form.addEventListener("submit", (event) => {
    event.preventDefault(); // submit no longer refreshes page

    // message text
    chatMessage = input.value
    if (chatMessage) {

        // emit message to server
        socket.emit("chatMessage", chatMessage);

        // clearing input
        input.value = "";
    }
});

// Append messages on client side
socket.on("message", (message) => {
    let div = document.createElement("div");
    div.classList.add("card")
    div.innerHTML =
        `<div">
            ${message.username} today at: ${message.time}
            <div id="text">
                ${message.text}
            </div>
        </div>`
    allMessages.appendChild(div);
    allMessages.scrollTop = allMessages.scrollHeight;
});

// catch emit from app.js and show information on chat.html
socket.on("roomUsers", ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

// Add room name to DOM
function outputRoomName(room) {
    document.getElementById("roomname").innerHTML = room;
    document.getElementById("roomlist").value = room;
}

// Add room users to DOM
function outputUsers(users) {
    document.getElementById("roomusers").innerHTML =
    `${users.map(user => `<li>${user.username}</li>`).join("")}`;
}