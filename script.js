console.log("Typing App FULL CONNECTED ✔");

/* ================= STATE ================= */
let typedText = "";
let currentSentence = "";
let startTime = null;
let timer = null;

let correctChars = 0;
let totalChars = 0;

let rawHistory = [];
let smoothHistory = [];
let spikeHistory = [];

let animationFrame = null;
let highScore = localStorage.getItem("highScore") || 0;

/* ================= INIT ================= */
window.onload = () => {
  document.getElementById("highScore").innerText = highScore;
  buildKeyboard();
};

/* ================= START GAME ================= */
function startGame() {
  const sentences = [
    "the quick brown fox jumps over the lazy dog",
    "practice typing every day to improve speed",
    "javascript makes websites interactive",
    "focus on accuracy before speed",
    "never stop learning new skills"
  ];

  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${
        word.split("").map(c => `<span>${c}</span>`).join("")
      }</span>`
    ).join(" ");

  typedText = "";
  updateTyped();

  correctChars = 0;
  totalChars = 0;

  startTime = Date.now();

  clearInterval(timer);
  timer = setInterval(() => {
    document.getElementById("time").innerText =
      Math.floor((Date.now() - startTime) / 1000);
  }, 1000);

  rawHistory = [];
  smoothHistory = [];
  spikeHistory = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* ================= UPDATE ================= */
function updateTyped() {
  document.getElementById("typed").innerText = typedText;
  check();
}

/* ================= CHECK ================= */
function check() {
  const words = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  correctChars = 0;
  totalChars = typedText.length;

  words.forEach((wordSpan, i) => {
    const letters = wordSpan.querySelectorAll("span");
    const typedWord = typedWords[i] || "";

    let wordCorrect = true;

    letters.forEach((letter, j) => {
      letter.classList.remove("correct", "wrong");

      const char = typedWord[j];
      if (!char) return;

      if (char === letter.innerText) {
        letter.classList.add("correct");
        correctChars++;
      } else {
        letter.classList.add("wrong");
        wordCorrect = false;
      }
    });
  });

  updateAccuracy();

  if (typedText === currentSentence) finishGame();
}

/* ================= ACCURACY ================= */
function updateAccuracy() {
  const acc = totalChars === 0
    ? 100
    : Math.round((correctChars / totalChars) * 100);

  document.getElementById("accuracy").innerText = acc;
}

/* ================= FINISH ================= */
function finishGame() {
  clearInterval(timer);
  cancelAnimationFrame(animationFrame);

  const time = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedText.length / 5) / (time / 60));

  document.getElementById("wpm").innerText = wpm;

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
}

/* ================= GRAPH ENGINE ================= */
function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 150;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!startTime) {
    animationFrame = requestAnimationFrame(drawGraph);
    return;
  }

  const time = (Date.now() - startTime) / 1000;

  const chars = typedText.length;
  const rawWpm = (chars / 5) / (time / 60);

  /* RAW */
  rawHistory.push(rawWpm);
  if (rawHistory.length > 120) rawHistory.shift();

  /* SMOOTH */
  const last = smoothHistory.length
    ? smoothHistory[smoothHistory.length - 1]
    : rawWpm;

  const smooth = last + (rawWpm - last) * 0.2;

  smoothHistory.push(smooth);
  if (smoothHistory.length > 120) smoothHistory.shift();

  /* SPIKES */
  if (Math.abs(rawWpm - smooth) > 15) {
    spikeHistory.push(smoothHistory.length - 1);
  }

  const max = Math.max(...smoothHistory, 20);

  /* SPEED ZONES */
  ctx.fillStyle = "rgba(255,0,0,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

  ctx.fillStyle = "rgba(255,255,0,0.03)";
  ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.3);

  ctx.fillStyle = "rgba(0,255,0,0.03)";
  ctx.fillRect(0, canvas.height * 0.2, canvas.width, canvas.height * 0.8);

  /* RAW LINE */
  ctx.beginPath();
  ctx.strokeStyle = "#777";
  ctx.lineWidth = 1;

  rawHistory.forEach((v, i) => {
    const x = (i / (rawHistory.length - 1)) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();

  /* SMOOTH LINE */
  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 2;

  smoothHistory.forEach((v, i) => {
    const x = (i / (smoothHistory.length - 1)) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();

  /* SPIKES */
  ctx.fillStyle = "#ff4d4d";

  spikeHistory.forEach(i => {
    const v = smoothHistory[i];
    if (!v) return;

    const x = (i / smoothHistory.length) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawGraph);
}

/* ================= KEYBOARD ================= */
function buildKeyboard() {
  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    row.forEach(letter => {
      const key = document.createElement("div");
      key.className = "key";
      key.innerText = letter;

      key.onclick = () => pressKey(letter.toLowerCase(), key);

      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });

  const bottom = document.createElement("div");
  bottom.className = "row";

  ["SPACE", "⌫"].forEach(type => {
    const key = document.createElement("div");
    key.className = "key wide";
    key.innerText = type;

    key.onclick = () => pressKey(type, key);

    bottom.appendChild(key);
  });

  keyboard.appendChild(bottom);
}

/* ================= INPUT ================= */
function pressKey(key, el) {
  if (!startTime) startGame();

  if (key === "⌫") typedText = typedText.slice(0, -1);
  else if (key === "SPACE") typedText += " ";
  else typedText += key;

  updateTyped();

  if (el) {
    el.style.background = "#4caf50";
    setTimeout(() => el.style.background = "#1c1c25", 80);
  }
}

/* ================= PHYSICAL KEYBOARD ================= */
document.addEventListener("keydown", e => {
  if (e.key === "Backspace") return pressKey("⌫");
  if (e.key === " ") return pressKey("SPACE");
  if (e.key.length === 1) pressKey(e.key.toLowerCase());
});