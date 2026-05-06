console.log("TZType FULL FIX v1.1 ✔");

let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let cursorIndex = 0;

let highScore = localStorage.getItem("highScore") || 0;

let wpmHistory = [];
let animationFrame;
let smoothWPM = 0;

let keyboardVisible = true;

/* DATA */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "clean code is better than clever code"
];

/* START */
function startGame() {
  finished = false;

  currentSentence =
    sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  cursorIndex = 0;
  startTime = Date.now();

  document.getElementById("highScore").innerText = highScore;

  renderSentence();
  updateTyped();

  wpmHistory = [];
  smoothWPM = 0;

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* RENDER */
function renderSentence() {
  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${
        word.split("").map(c => `<span class="letter">${c}</span>`).join("")
      }</span>`
    ).join(" ");
}

/* SMOOTH WPM */
function getWPM() {
  if (!startTime) return 0;

  const time = (Date.now() - startTime) / 1000;
  if (time < 1) return 0;

  const chars = typedText.length;
  const raw = (chars / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.2;

  return Math.round(smoothWPM);
}

/* INPUT */
function pressKey(key) {
  if (finished) return;

  if (!startTime) startGame();

  if (key === "⌫") {
    typedText = typedText.slice(0, -1);
    cursorIndex = Math.max(0, cursorIndex - 1);
  } else if (key === "SPACE") {
    typedText += " ";
    cursorIndex++;
  } else {
    typedText += key;
    cursorIndex++;
  }

  updateTyped();

  if (typedText === currentSentence) finishGame();
}

/* UPDATE */
function updateTyped() {
  document.getElementById("typed").innerHTML =
    typedText.split("").map((c, i) => {
      const show = c === " " ? "·" : c;

      if (i === cursorIndex && !finished) {
        return `<span class="cursor">${show}</span>`;
      }
      return show;
    }).join("");

  highlight();

  document.getElementById("wpm").innerText = getWPM();
}

/* HIGHLIGHT */
function highlight() {
  const words = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  words.forEach((w, i) => {
    const letters = w.querySelectorAll(".letter");
    const typed = typedWords[i] || "";

    letters.forEach((l, j) => {
      l.classList.remove("correct", "wrong");

      if (!typed[j]) return;

      if (typed[j] === l.innerText) {
        l.classList.add("correct");
      } else {
        l.classList.add("wrong");
      }
    });
  });
}

/* FINISH */
function finishGame() {
  finished = true;

  const wpm = getWPM();

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", wpm);
  }

  document.getElementById("highScore").innerText = highScore;
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

  const wpm = getWPM();

  wpmHistory.push(wpm);
  if (wpmHistory.length > 120) wpmHistory.shift();

  // stabilize drops
  if (wpmHistory.length > 2) {
    const last = wpmHistory[wpmHistory.length - 1];
    const prev = wpmHistory[wpmHistory.length - 2];

    if (last < prev * 0.5) {
      wpmHistory[wpmHistory.length - 1] = prev * 0.7;
    }
  }

  const max = Math.max(...wpmHistory, 20);

  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";

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

/* TOGGLE KEYBOARD */
function toggleKeyboard() {
  const kb = document.getElementById("keyboard");

  keyboardVisible = !keyboardVisible;

  kb.style.opacity = keyboardVisible ? "1" : "0";
  kb.style.pointerEvents = keyboardVisible ? "auto" : "none";
}

/* KEY INPUT */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (e.key === "Backspace") return pressKey("⌫");

  if (e.key === " ") {
    e.preventDefault();
    return pressKey("SPACE");
  }

  if (e.key.length === 1) pressKey(e.key.toLowerCase());
});

/* INIT */
window.onload = buildKeyboard;