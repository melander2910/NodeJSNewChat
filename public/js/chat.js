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
    div.innerHTML =
        `<div class="card shadow bg-white rounded mt-4" style="margin: 1px;">
            <div>
            ${message.username} today at: ${message.time}        
            </div>
            <div id="text">
                ${message.text}
            </div>
        </div>`
    allMessages.appendChild(div);
    document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight
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
    `${users.map(user => `
    <div class="card m-2 center pd-5" style="height: 75px; border: none; box-shadow: 0 0 5px; width: 75px; border-radius: 45px; line-height: 69px;">
        <span> ${user.username} </span>
    </div>
    `).join("")}`;
}

// prompt leave room btn
document.getElementById('leave-room').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = "/logout";
    }
});