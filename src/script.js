const btnSend = document.getElementById("btnSend");
const btnPos = document.getElementById("btnPosition");
const inputMessage = document.getElementById("inputMessage");
const messageBox = document.getElementById("messageBox");
const messageBoxJQ = $("#messageBox");

const wsUrl = "wss://echo.websocket.org/";
let websocket;

function addMessage(text, sender, color=null) {

  if (!text) {
    return ;
  }

  let newMessage = null;

  if (text.startsWith("https://www")) {
    newMessage = document.createElement("a");
    newMessage.setAttribute("href", text);
    newMessage.setAttribute("target", "_blank");
    newMessage.textContent = "Open at StreetMap";
    color = "#ffcf00";
  }
  else {
    newMessage = document.createElement("span");
    newMessage.textContent = text;
  }
  messageBox.appendChild(newMessage);

  newMessage.style.alignSelf = (sender == "user") ? "flex-end" : "flex-start";
  newMessage.classList.add("message");
  newMessage.style.color = color ? color : "white";
  messageBoxJQ.animate({scrollTop: messageBox.clientHeight - messageBox.scrollHeight}, 100);
}

function sendMessage() {
  addMessage(inputMessage.value, "user");
  websocket.send(inputMessage.value);
  inputMessage.value = "";
}

btnSend.addEventListener("click", sendMessage);
document.addEventListener("keydown", (e) => {if (e.key == "Enter") sendMessage()});

btnPos.addEventListener("click", _ => {

  const showGeolocation = async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    websocket.send(
      `https://www.openstreetmap.org/#map=19/${latitude}/${longitude}`
    );
  }

  const showError = _ => {
    websocket.send("Can you give an access?");
  }

  if (!navigator.geolocation) {
    websocket.send("Sorry, can't get your geolocation");
  }
  else {
    btnPos.textContent = "Processing...";
    navigator.geolocation.getCurrentPosition(showGeolocation, showError);
    btnPos.textContent = "Geolocation";
  }
});

window.addEventListener("DOMContentLoaded", _ => {

  websocket = new WebSocket(wsUrl);

  websocket.onclose = _ => {
    addMessage("By by", "server");
  }
  websocket.onmessage = (event) => {
    addMessage(event.data, "server");
  }
  websocket.onerror = (event) => {
    addMessage(`Error: ${event.data}`, "server", "red");
  }
});

window.addEventListener("beforeunload", _ => {
  websocket.close();
  websocket = null;
});
