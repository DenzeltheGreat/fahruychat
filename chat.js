// Connect to signaling server
const ws = new WebSocket("wss://your-server-url:8080");

let pc = new RTCPeerConnection();
let channel = pc.createDataChannel("chat");

channel.onopen = () => log("✅ Connection established!");
channel.onmessage = e => log("Peer: " + e.data);

pc.ondatachannel = e => {
  channel = e.channel;
  channel.onmessage = ev => log("Peer: " + ev.data);
};

pc.onicecandidate = e => {
  if (e.candidate) {
    ws.send(JSON.stringify({ candidate: e.candidate }));
  }
};

ws.onmessage = async e => {
  const data = JSON.parse(e.data);
  if (data.offer) {
    await pc.setRemoteDescription(data.offer);
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({ answer }));
  }
  if (data.answer) {
    await pc.setRemoteDescription(data.answer);
  }
  if (data.candidate) {
    await pc.addIceCandidate(data.candidate);
  }
};

async function createOffer() {
  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ offer }));
}

function sendMessage() {
  let msg = document.getElementById("msg").value;
  if (channel && channel.readyState === "open") {
    channel.send(msg);
    log("You: " + msg);
    document.getElementById("msg").value = "";
  } else {
    log("⚠️ Channel not open yet!");
  }
}

function log(msg) {
  let chat = document.getElementById("chat");
  chat.innerHTML += msg + "<br>";
  chat.scrollTop = chat.scrollHeight;
}

// Auto-start offer when page loads
ws.onopen = () => {
  createOffer();
};
