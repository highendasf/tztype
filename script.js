console.log("Typing App FULL UPGRADED ✔");

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
let wpmMapPoints = [];

let animationFrame = null;

let highScore = localStorage.getItem("highScore") || 0;

/* ================= MODE ================= */
let mode = "sentence";

/* ================= WORD BANK ================= */
const words = [
  "the","quick","brown","fox","jumps","over","lazy","dog",
  "practice","typing","speed","accuracy","focus","keyboard",
  "javascript","function","variable","object","array",
  "developer","code","debug","error","logic","system",
  "learn","build","create","fast","slow","improve",
  "programming","computer","software","internet","browser"
];

/* ================= SENTENCES ================= */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day to improve speed and accuracy",
  "javascript makes websites interactive and dynamic",
  "focus on accuracy before speed will give better results",
  "never stop learning new skills in programming",
  "clean code is better than clever code",
  "debugging is part of becoming a better developer",
  "consistency is more important than motivation",
  "slow is smooth smooth is fast",
  "write code like someone else will read it"
];

/* ================= INIT ================= */
window.onload = () => {
  document.getElementById("highScore").innerText = highScore;

  setupModeButtons();
  buildKeyboard();
  setMode("sentence");
};

/* ================= MODE SWITCH ================= */
function setupModeButtons() {
  const sBtn = document.getElementById("sentenceModeBtn");
  const wBtn = document.getElementById("wordModeBtn");

  sBtn.onclick = () => setMode("sentence");
  wBtn.onclick = () => setMode("word");
}

function setMode(m) {
  mode = m;

  document.getElementById("sentenceModeBtn").classList.remove("active");
  document.getElementById("wordModeBtn").classList.remove("active");

  if (m === "sentence") {
    document.getElementById("sentenceModeBtn").classList.add("active");
  } else {
    document.getElementById("wordModeBtn").classList.add("active");
  }
}

/* ================= START GAME ================= */
function startGame() {
  if (mode === "word") {
    currentSentence = generateRandomSentence(12);
  } else {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
  }

  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${
        word.split("").map(c => `<span>${c}</span>`).join("")
      }</span>`
    ).join(" ");

  typedText = "";
  updateTyped();

  startTime = Date.now();

  rawHistory = [];
  smoothHistory = [];
  spikeHistory = [];
  wpmMapPoints = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* ================= RANDOM WORDS ================= */
function generateRandomSentence(count = 12) {
  let result = [];
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(" ");
}

/* ================= INPUT ================= */
function updateTyped() {
  document.getElementById("typed").innerText = typedText;
  check();
}

/* ================= CHECK ================= */
function check() {
  const wordsEl = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  correctChars = 0;
  totalChars = typedText.length;

  wordsEl.forEach((wordSpan, i) => {
    const typedWord = typedWords[i] || "";

    wordSpan.style.color =
      typedWord === wordSpan.innerText ? "#4caf50" : "#ff4d4d";
  });

  if (typedText === currentSentence) finishGame();
}

/* ================= FINISH ================= */
function finishGame() {
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

/* ================= GRAPH ================= */
function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = 150 * dpr;

  ctx.scale(dpr, dpr);
  canvas.style.width = rect.width + "px";
  canvas.style.height = "150px";

  ctx.clearRect(0, 0, rect.width, 150);

  if (!startTime) {
    animationFrame = requestAnimationFrame(drawGraph);
    return;
  }

  const time = (Date.now() - startTime) / 1000;
  const chars = typedText.length;

  const rawWpm = (chars / 5) / (time / 60);

  rawHistory.push(rawWpm);
  if (rawHistory.length > 120) rawHistory.shift();

  const last = smoothHistory.at(-1) || rawWpm;
  const smooth = last + (rawWpm - last) * 0.2;

  smoothHistory.push(smooth);
  if (smoothHistory.length > 120) smoothHistory.shift();

  if (Math.abs(rawWpm - smooth) > 15) {
    spikeHistory.push(smoothHistory.length - 1);
  }

  wpmMapPoints.push({
    wpm: Math.round(smooth),
    index: smoothHistory.length - 1
  });

  if (wpmMapPoints.length > 20) wpmMapPoints.shift();

  const max = Math.max(...smoothHistory, 20);

  /* ZONES */
  ctx.fillStyle = "rgba(255,0,0,0.05)";
  ctx.fillRect(0, 0, rect.width, 150 * 0.5);

  ctx.fillStyle = "rgba(255,255,0,0.03)";
  ctx.fillRect(0, 150 * 0.5, rect.width, 150 * 0.3);

  ctx.fillStyle = "rgba(0,255,0,0.03)";
  ctx.fillRect(0, 150 * 0.2, rect.width, 150 * 0.8);

  /* SMOOTH LINE */
  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 2;

  smoothHistory.forEach((v, i) => {
    const x = (i / smoothHistory.length) * rect.width;
    const y = 150 - (v / max) * 150;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();

  /* WPM MAP */
  ctx.font = "12px Arial";
  ctx.textAlign = "center";

  wpmMapPoints.forEach(p => {
    const v = smoothHistory[p.index];
    if (!v) return;

    const x = (p.index / smoothHistory.length) * rect.width;
    const y = 150 - (v / max) * 150;

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 10, y - 14, 20, 12);

    ctx.fillStyle = "#fff";
    ctx.fillText(p.wpm, x, y - 8);
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
    el.style.transform = "scale(0.9)";
    setTimeout(() => el.style.transform = "scale(1)", 80);
  }
}

/* ================= PHYSICAL KEYBOARD ================= */
document.addEventListener("keydown", e => {
  if (e.key === "Backspace") return pressKey("⌫");
  if (e.key === " ") return pressKey("SPACE");
  if (e.key.length === 1) pressKey(e.key.toLowerCase());
});