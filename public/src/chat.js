const ws = new WebSocket('wss://' + location.host + '/');

ws.addEventListener("open", () => {
    console.log("Connected to WebSocket.");
    retrieveMessageHistory();
});

const chatDiv = document.getElementById("chat-div");

const msgInput = document.getElementById("textbox-input");
const msgSendBtn = document.getElementById("textbox-send");

ws.onmessage = (event) => {
    console.log(event.data);

    try {
        let json = JSON.parse(event.data);
        if (!json.ok) {
            console.log("Server return error: " + json.reason);
            return;
        }
        switch (json.method) {
            case "sendMessage":
                printMessage(json.data);
                break;

            case "getMessageHistory":
                json.data.forEach(msg => {
                    printMessage(msg);
                });

                chatDiv.scrollTop = chatDiv.scrollHeight;
                break;

            default:
                console.log("Unrecognised server method: " + json.method);
                break;
        }
    } catch (error) {
        console.log(error);
    }
};


msgSendBtn.addEventListener("click", event => sendMessage(event));

function sendMessage(event) {
    let msg = msgInput.value.trim();
    if (msg == "") return;

    //sendMessageLocal(msg); Needs a server OK check
    sendMessageToServer(msg);
}

function sendMessageToServer(msg) {
    let json = { userId: "0", method: "sendMessage", messageContent: msg, timestamp: Date.now() };

    ws.send(JSON.stringify(json));
}

function sendMessageLocal(msg) {
    printMessage(msg);
}

function printMessage(msg) {
    let formattedTime = getFormattedDateTime(msg.sentAt);

    let p = document.createElement("p");
    p.textContent = msg.id + " : " + msg.userId + " : " + msg.content + " : " + formattedTime;
    chatDiv.appendChild(p);

    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function retrieveMessageHistory() {
    let json = { method: "getMessageHistory" }

    ws.send(JSON.stringify(json));
}

function getFormattedDateTime(timestamp) {
    let date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, 0);
    const minutes = date.getMinutes().toString().padStart(2, 0);
    const seconds = date.getSeconds().toString().padStart(2, 0);
    return `${hours}:${minutes}:${seconds}`;
}