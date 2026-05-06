console.log("Typing App FULL CONNECTED ✔");

let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let cursorIndex = 0;

let highScore = localStorage.getItem("highScore") || 0;

let wpmHistory = [];
let animationFrame;

/* ================= DATA ================= */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "clean code is better than clever code"
];

/* ================= INIT ================= */
window.onload = () => {
  document.getElementById("highScore").innerText = highScore;
  buildKeyboard();
};

/* ================= START ================= */
function startGame() {
  finished = false;

  currentSentence =
    sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  cursorIndex = 0;
  startTime = Date.now();

  renderSentence();
  updateTyped();

  wpmHistory = [];
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* ================= RENDER ================= */
function renderSentence() {
  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${
        word.split("").map(c => `<span class="letter">${c}</span>`).join("")
      }</span>`
    ).join(" ");
}

/* ================= WPM ================= */
function getWPM() {
  const time = (Date.now() - startTime) / 1000;
  if (time < 1) return 0;

  const words = typedText.trim().split(/\s+/).length;
  return Math.round((words / time) * 60);
}

/* ================= INPUT ================= */
function pressKey(key) {
  if (finished) return;

  if (!startTime) startGame();

  if (key === "⌫") {
    typedText = typedText.slice(0, -1);
    cursorIndex = Math.max(0, cursorIndex - 1);
  }
  else if (key === "SPACE") {
    typedText += " ";
    cursorIndex++;
  }
  else {
    typedText += key;
    cursorIndex++;
  }

  updateTyped();

  if (typedText === currentSentence) finishGame();
}

/* ================= UPDATE + CURSOR ================= */
function updateTyped() {
  document.getElementById("typed").innerHTML =
    typedText.split("").map((c, i) => {
      const display = c === " " ? "·" : c;

      if (i === cursorIndex && !finished) {
        return `<span class="cursor">${display}</span>`;
      }
      return display;
    }).join("");

  highlight();
}

/* ================= HIGHLIGHT ================= */
function highlight() {
  const wordsEl = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  wordsEl.forEach((wordEl, i) => {
    const letters = wordEl.querySelectorAll(".letter");
    const typedWord = typedWords[i] || "";

    letters.forEach((letter, j) => {
      const char = typedWord[j];

      letter.classList.remove("correct", "wrong");

      if (!char) return;

      if (char === letter.innerText) {
        letter.classList.add("correct");
      } else {
        letter.classList.add("wrong");
      }
    });
  });
}

/* ================= FINISH ================= */
function finishGame() {
  finished = true;

  const wpm = getWPM();

  document.getElementById("wpm").innerText = wpm;

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", wpm);
    document.getElementById("highScore").innerText = wpm;
  }
}

/* ================= GRAPH ================= */
function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = 150;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!startTime) {
    animationFrame = requestAnimationFrame(drawGraph);
    return;
  }

  const wpm = getWPM();

  wpmHistory.push(wpm);
  if (wpmHistory.length > 120) wpmHistory.shift();

  const max = Math.max(...wpmHistory, 20);

  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 2;

  wpmHistory.forEach((v, i) => {
    const x = (i / wpmHistory.length) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();

  animationFrame = requestAnimationFrame(drawGraph);
}

/* ================= KEYBOARD ================= */
function buildKeyboard() {
  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const kb = document.getElementById("keyboard");

  layout.forEach(row => {
    const div = document.createElement("div");
    div.className = "row";

    row.forEach(k => {
      const key = document.createElement("div");
      key.className = "key";
      key.innerText = k;
      key.onclick = () => pressKey(k.toLowerCase());
      div.appendChild(key);
    });

    kb.appendChild(div);
  });

  const bottom = document.createElement("div");
  bottom.className = "row";

  ["SPACE","⌫"].forEach(k => {
    const key = document.createElement("div");
    key.className = "key wide";
    key.innerText = k;
    key.onclick = () => pressKey(k);
    bottom.appendChild(key);
  });

  kb.appendChild(bottom);
}

/* ================= KEY INPUT ================= */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (e.key === "Backspace") return pressKey("⌫");

  if (e.key === " ") {
    e.preventDefault();
    return pressKey("SPACE");
  }

  if (e.key.length === 1) pressKey(e.key.toLowerCase());
});