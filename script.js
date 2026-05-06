console.log("TZType FULL SYSTEM ✔");

let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let cursorIndex = 0;

let mode = "words";

let highScore = localStorage.getItem("highScore") || 0;

let wpmHistory = [];
let accuracyHistory = [];

let smoothWPM = 0;
let smoothAcc = 100;

let animationFrame;
let keyboardVisible = true;

/* DATA */
const wordBank = [
  "apple","banana","keyboard","screen","typing","speed",
  "accuracy","focus","practice","javascript","coding","react"
];

const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day to improve speed",
  "javascript makes websites interactive and dynamic",
  "focus on accuracy before increasing speed",
  "clean code is better than clever code"
];

/* START */
function startGame() {
  finished = false;

  if (mode === "words") {
    currentSentence = Array.from({ length: 15 }, () =>
      wordBank[Math.floor(Math.random() * wordBank.length)]
    ).join(" ");
  } else {
    currentSentence =
      sentences[Math.floor(Math.random() * sentences.length)];
  }

  typedText = "";
  cursorIndex = 0;
  startTime = Date.now();

  renderSentence();
  updateTyped();

  wpmHistory = [];
  accuracyHistory = [];

  smoothWPM = 0;
  smoothAcc = 100;

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

/* WPM */
function getWPM() {
  if (!startTime) return 0;

  const time = (Date.now() - startTime) / 1000;
  if (time < 1) return 0;

  const chars = typedText.length;
  const raw = (chars / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.08;

  return Math.round(smoothWPM);
}

/* ACCURACY */
function getAccuracy() {
  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentSentence[i]) correct++;
  }

  let raw = typedText.length === 0 ? 100 :
    (correct / typedText.length) * 100;

  smoothAcc += (raw - smoothAcc) * 0.1;

  return Math.round(smoothAcc);
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
  document.getElementById("accuracy").innerText = getAccuracy();
  document.getElementById("highScore").innerText = highScore;
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
  const acc = getAccuracy();

  wpmHistory.push(wpm);
  accuracyHistory.push(acc);

  if (wpmHistory.length > 120) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  const maxWPM = Math.max(...wpmHistory, 20);

  drawArea(wpmHistory, maxWPM, "#4caf50", "rgba(76,175,80,0.3)");
  drawArea(accuracyHistory, 100, "#2196f3", "rgba(33,150,243,0.3)");

  animationFrame = requestAnimationFrame(drawGraph);
}

/* SMOOTH AREA GRAPH */
function drawArea(data, max, stroke, fill) {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  if (data.length < 2) return;

  ctx.beginPath();

  ctx.moveTo(0, canvas.height);

  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    const cx = (x + (i > 0 ? (i-1)/(data.length-1)*canvas.width : x)) / 2;

    ctx.quadraticCurveTo(x, y, cx, y);
  });

  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();

  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/* MODE */
function toggleMode() {
  mode = mode === "words" ? "sentences" : "words";
  document.getElementById("modeLabel").innerText =
    mode === "words" ? "Words" : "Sentences";

  startGame();
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

/* TOGGLE */
function toggleKeyboard() {
  const kb = document.getElementById("keyboard");

  keyboardVisible = !keyboardVisible;

  kb.style.opacity = keyboardVisible ? "1" : "0";
  kb.style.pointerEvents = keyboardVisible ? "auto" : "none";
}

/* INPUT */
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