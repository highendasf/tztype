console.log("Typing App FULL CONNECTED ✔");

/* STATE */
let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let mode = "sentence";

let highScore = localStorage.getItem("highScore") || 0;

/* GRAPH */
let wpmHistory = [];
let animationFrame;

/* WORD BANK */
const words = [
  "the","quick","brown","fox","jumps","typing","speed","code",
  "learn","focus","javascript","function","variable","array",
  "developer","debug","error","logic","system"
];

/* SENTENCES */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "clean code is better than clever code"
];

/* INIT */
window.onload = () => {
  document.getElementById("highScore").innerText = highScore;

  setupMode();
  buildKeyboard();
};

/* MODE */
function setupMode() {
  document.getElementById("sentenceModeBtn").onclick = () => mode = "sentence";
  document.getElementById("wordModeBtn").onclick = () => mode = "word";
}

/* START */
function startGame() {
  finished = false;

  currentSentence =
    mode === "word"
      ? generateWords(12)
      : sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  startTime = Date.now();

  renderSentence();

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* WORD GENERATOR */
function generateWords(n) {
  let out = [];
  for (let i = 0; i < n; i++) {
    out.push(words[Math.floor(Math.random() * words.length)]);
  }
  return out.join(" ");
}

/* RENDER SENTENCE (IMPORTANT FOR HIGHLIGHTING) */
function renderSentence() {
  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${
        word.split("").map(c => `<span class="letter">${c}</span>`).join("")
      }</span>`
    ).join(" ");
}

/* INPUT */
function pressKey(key) {
  if (finished) return;

  if (!startTime) startGame();

  if (key === "⌫") typedText = typedText.slice(0, -1);
  else if (key === "SPACE") typedText += " ";
  else typedText += key;

  updateTyped();

  if (typedText === currentSentence) finishGame();
}

/* UPDATE + HIGHLIGHT */
function updateTyped() {
  document.getElementById("typed").innerText = typedText;

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

/* FINISH */
function finishGame() {
  finished = true;

  const time = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedText.length / 5) / (time / 60));

  document.getElementById("wpm").innerText = wpm;

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
}

/* GRAPH */
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

  const time = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedText.length / 5) / (time / 60));

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

/* KEYBOARD */
function buildKeyboard() {
  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";

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

/* PHYSICAL KEYBOARD */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (e.key === "Backspace") return pressKey("⌫");

  if (e.key === " ") {
    e.preventDefault();
    return pressKey("SPACE");
  }

  if (e.key.length === 1) pressKey(e.key.toLowerCase());
});

/* TOGGLE KEYBOARD */
document.getElementById("toggleKeyboardBtn").onclick = () => {
  document.getElementById("keyboard").classList.toggle("hidden");
};

/* TAB SHORTCUT */
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    document.getElementById("keyboard").classList.toggle("hidden");
  }
});