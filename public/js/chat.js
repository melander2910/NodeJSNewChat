// Client side

const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const allMessages = document.getElementById("messages");

// Listen for messages from client side
form.addEventListener("submit", (event) => {
    event.preventDefault(); // submit no longer refreshes page
    chatMessage = input.value
    if (chatMessage) {
        socket.emit("chatMessage", chatMessage);
        input.value = "";
    }
});

// Append messages on client side
socket.on("message", (message) => {
    let div = document.createElement("div");
    div.classList.add("card")
    div.innerHTML =
        `<div id="username time">
            ${"Test"} today at: ${"time"}
            <div id="text">
                ${message}
            </div>
        </div>`
    allMessages.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
});