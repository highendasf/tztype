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

/* ===================== SENTENCES ===================== */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day to improve speed",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "never stop learning new skills"
];

/* ===================== SAFE INIT ===================== */
window.onload = () => {
  const hs = document.getElementById("highScore");
  const typed = document.getElementById("typed");

  if (hs) hs.innerText = highScore;
  if (typed) typed.innerText = "";

  log("DOM READY ✔");
};

/* ===================== START GAME ===================== */
function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  updateTyped();

  correctChars = 0;
  totalChars = 0;

  startTime = Date.now();

  clearInterval(timer);
  timer = setInterval(() => {
    const t = document.getElementById("time");
    if (t) t.innerText = Math.floor((Date.now() - startTime) / 1000);
  }, 1000);

  wpmHistory = [];
  smoothHistory = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animateGraph);

  log("GAME STARTED ✔");
}

/* ===================== UPDATE ===================== */
function updateTyped() {
  const el = document.getElementById("typed");
  if (el) el.innerText = typedText;

  check();
}

/* ===================== CHECK ===================== */
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

    wordSpan.classList.remove("word-correct", "word-wrong");

    if (!typedWord) return;

    if (typedWord === wordSpan.innerText) {
      wordSpan.classList.add("word-correct");
    } else if (!wordCorrect) {
      wordSpan.classList.add("word-wrong");
    }
  });

  updateAccuracy();

  if (typedText === currentSentence) finishGame();
}

/* ===================== ACCURACY ===================== */
function updateAccuracy() {
  const accEl = document.getElementById("accuracy");

  let acc = totalChars === 0
    ? 100
    : Math.round((correctChars / totalChars) * 100);

  if (accEl) accEl.innerText = acc;
}

/* ===================== FINISH ===================== */
function finishGame() {
  clearInterval(timer);
  cancelAnimationFrame(animationFrame);

  const time = (Date.now() - startTime) / 1000;
  const words = currentSentence.split(" ").length;
  const wpm = Math.round((words / time) * 60);

  const wpmEl = document.getElementById("wpm");
  if (wpmEl) wpmEl.innerText = wpm;

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", highScore);

    const hs = document.getElementById("highScore");
    if (hs) hs.innerText = highScore;
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
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = 150;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!startTime) return;

  const time = (Date.now() - startTime) / 1000;
  if (time < 1) return;

  const wordsTyped = typedText.trim() === ""
    ? 0
    : typedText.trim().split(/\s+/).length;

  const wpm = Math.max(0, Math.round((wordsTyped / time) * 60));

  wpmHistory.push(wpm);
  if (wpmHistory.length > 120) wpmHistory.shift();

  const last = smoothHistory.length
    ? smoothHistory[smoothHistory.length - 1]
    : wpm;

  const smooth = last + (wpm - last) * 0.35;

  smoothHistory.push(smooth);
  if (smoothHistory.length > 120) smoothHistory.shift();

  if (smoothHistory.length < 2) return;

  const max = Math.max(...smoothHistory, 50);

  ctx.beginPath();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 2;

  smoothHistory.forEach((v, i) => {
    const x = (i / (smoothHistory.length - 1)) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* ===================== KEYBOARD ===================== */
document.addEventListener("keydown", e => {
  if (!currentSentence) return;

  const finished = typedText === currentSentence;

  if (e.key === " ") {
    e.preventDefault();

    if (!startTime) {
      startGame();
      return;
    }

    if (finished) {
      startGame();
      return;
    }

    typedText += " ";
    updateTyped();
    return;
  }

  if (e.key === "Backspace") {
    typedText = typedText.slice(0, -1);
    updateTyped();
    return;
  }

  if (e.key.length === 1) {
    typedText += e.key.toLowerCase();
    updateTyped();
  }
});