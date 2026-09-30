let pc = new RTCPeerConnection();
let channel = pc.createDataChannel("chat");

// When the data channel opens
channel.onopen = () => log("✅ Connection established!");
channel.onmessage = e => log("Peer: " + e.data);

// ICE candidate handling (final SDP gets dumped into the textarea)
pc.onicecandidate = e => {
  if (e.candidate) return; // wait until gathering is complete
  document.getElementById("offer").value = JSON.stringify(pc.localDescription);
};

// If the other peer creates the channel
pc.ondatachannel = e => {
  channel = e.channel;
  channel.onmessage = ev => log("Peer: " + ev.data);
};

function log(msg) {
  let chat = document.getElementById("chat");
  chat.innerHTML += msg + "<br>";
  chat.scrollTop = chat.scrollHeight;
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

async function createOffer() {
  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
}

async function createAnswer() {
  let offer = JSON.parse(document.getElementById("offer").value);
  await pc.setRemoteDescription(offer);
  let answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  document.getElementById("answer").value = JSON.stringify(pc.localDescription);
}

async function setRemoteAnswer() {
  let answer = JSON.parse(document.getElementById("answer").value);
  await pc.setRemoteDescription(answer);
}
