function log(msg) {
  console.log(msg);
}

/* ===================== STATE ===================== */
let typedText = "";
let currentSentence = "";
let startTime = null;
let timer = null;
let correctChars = 0;
let totalChars = 0;
let wpmHistory = [];
let smoothHistory = [];
let animationFrame = null;
let highScore = localStorage.getItem("highScore") || 0;

const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day to improve speed",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "never stop learning new skills"
];

/* ===================== INIT ===================== */
window.onload = () => {
  createKeyboard();
  const hs = document.getElementById("highScore");
  if (hs) hs.innerText = highScore;
  log("DOM READY ✔");
};

function createKeyboard() {
  const kb = document.getElementById("keyboard");
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", "Backspace"]
  ];
  rows.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";
    row.forEach(key => {
      const div = document.createElement("div");
      div.className = "key" + (key === "Backspace" ? " wide" : "");
      div.innerText = key === "Backspace" ? "⌫" : key;
      div.setAttribute("data-key", key.toLowerCase());
      rowDiv.appendChild(div);
    });
    kb.appendChild(rowDiv);
  });
}

/* ===================== GAME ENGINE ===================== */
function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
  renderSentence(currentSentence);
  
  typedText = "";
  updateTyped();
  startTime = Date.now();
  wpmHistory = [];
  smoothHistory = [];

  clearInterval(timer);
  timer = setInterval(() => {
    const t = document.getElementById("time");
    if (t) t.innerText = Math.floor((Date.now() - startTime) / 1000);
  }, 1000);

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animateGraph);
  log("GAME STARTED ✔");
}

function renderSentence(text) {
  const el = document.getElementById("sentence");
  el.innerHTML = "";
  text.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    el.appendChild(span);
  });
}

function updateTyped() {
  const el = document.getElementById("typed");
  if (el) el.innerText = typedText;
  check();
}

function check() {
  const spans = document.querySelectorAll("#sentence span");
  correctChars = 0;
  totalChars = typedText.length;

  spans.forEach((span, i) => {
    span.classList.remove("correct", "wrong");
    if (typedText[i] == null) return;
    if (typedText[i] === span.innerText) {
      span.classList.add("correct");
      correctChars++;
    } else {
      span.classList.add("wrong");
    }
  });

  updateAccuracy();
  if (typedText === currentSentence && currentSentence !== "") finishGame();
}

function updateAccuracy() {
  const accEl = document.getElementById("accuracy");
  const acc = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
  if (accEl) accEl.innerText = acc;
}

function finishGame() {
  clearInterval(timer);
  cancelAnimationFrame(animationFrame);
  
  const timeSecs = (Date.now() - startTime) / 1000;
  const words = currentSentence.split(" ").length;
  const wpm = Math.round((words / timeSecs) * 60);
  
  document.getElementById("wpm").innerText = wpm;
  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
  log("GAME FINISHED ✔");
}

/* ===================== GRAPH ===================== */
function animateGraph() {
  drawGraph();
  animationFrame = requestAnimationFrame(animateGraph);
}

function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");
  if (canvas.width !== canvas.offsetWidth) {
    canvas.width = canvas.offsetWidth;
    canvas.height = 150;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!startTime || typedText.length < 2) return;

  const time = (Date.now() - startTime) / 1000;
  const wordsTyped = typedText.trim().split(/\s+/).length;
  const wpm = Math.max(0, Math.round((wordsTyped / time) * 60));

  wpmHistory.push(wpm);
  if (wpmHistory.length > 100) wpmHistory.shift();

  const last = smoothHistory.length ? smoothHistory[smoothHistory.length - 1] : wpm;
  const smooth = last + (wpm - last) * 0.2;
  smoothHistory.push(smooth);
  if (smoothHistory.length > 100) smoothHistory.shift();

  const maxWpm = Math.max(...smoothHistory, 60);
  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 3;
  smoothHistory.forEach((v, i) => {
    const x = (i / (smoothHistory.length - 1)) * canvas.width;
    const y = canvas.height - (v / maxWpm) * (canvas.height - 20) - 10;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}

/* ===================== INPUT ===================== */
document.addEventListener("keydown", e => {
  const key = e.key;
  const vKey = document.querySelector(`[data-key="${key.toLowerCase()}"]`);
  
  if (vKey) {
    vKey.style.background = "#4caf50";
    vKey.style.color = "#0f0f14";
    setTimeout(() => { vKey.style.background = ""; vKey.style.color = ""; }, 100);
  }

  if (key === " " && (!startTime || typedText === currentSentence)) {
    e.preventDefault();
    startGame();
    return;
  }

  if (!startTime || typedText === currentSentence) return;

  if (key === "Backspace") {
    typedText = typedText.slice(0, -1);
  } else if (key.length === 1) {
    typedText += key;
  }
  updateTyped();
});
