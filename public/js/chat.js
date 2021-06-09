// Client side

const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const allUserMessages = document.getElementById("messages");

form.addEventListener("submit", (event) => {
    event.preventDefault(); // submit no longer refreshes page
    chatMessage = input.value
    if(chatMessage){
        socket.emit("chatMessage", chatMessage);
        input.value = "";
    }
});

socket.on("chatMessage", (chatMessage) => {
    let UserMessage = document.createElement("li");
    UserMessage.textContent = chatMessage;
    allUserMessages.appendChild(UserMessage);
});

// $("#form").on("submit", (event) => {
//     let chatMessage = event.target.value
//     if(chatMessage){
//         socket.emit("chatMessage", chatMessage);
//         chatMessage = "";
//     }
// });


