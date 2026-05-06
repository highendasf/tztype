console.log("Typing game running ✔");

/* ================= STATE ================= */
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

/* ================= SENTENCES ================= */
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day to improve speed",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "never stop learning new skills"
];

/* ================= INIT ================= */
window.onload = () => {
  document.getElementById("highScore").innerText = highScore;
};

/* ================= START ================= */
function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  // 🔥 render words
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

  wpmHistory = [];
  smoothHistory = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animateGraph);
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
  const words = currentSentence.split(" ").length;
  const wpm = Math.round((words / time) * 60);

  document.getElementById("wpm").innerText = wpm;

  if (wpm > highScore) {
    highScore = wpm;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
}

/* ================= GRAPH ================= */
function animateGraph() {
  drawGraph();
  animationFrame = requestAnimationFrame(animateGraph);
}

function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = 150;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!startTime) return;

  const time = (Date.now() - startTime) / 1000;
  if (time < 0.3) return;

  const chars = typedText.length;
  const rawWpm = (chars / 5) / (time / 60);
  const wpm = Math.max(0, Math.round(rawWpm));

  wpmHistory.push(wpm);
  if (wpmHistory.length > 120) wpmHistory.shift();

  const last = smoothHistory.length
    ? smoothHistory[smoothHistory.length - 1]
    : wpm;

  const smooth = last + (wpm - last) * 0.2;

  smoothHistory.push(smooth);
  if (smoothHistory.length > 120) smoothHistory.shift();

  if (smoothHistory.length < 2) return;

  const max = Math.max(...smoothHistory, 50);

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#4caf50";

  smoothHistory.forEach((v, i) => {
    const x = (i / (smoothHistory.length - 1)) * canvas.width;
    const y = canvas.height - (v / max) * canvas.height;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* ================= KEYBOARD ================= */
document.addEventListener("keydown", e => {
  const finished = typedText === currentSentence;

  if (e.key === " ") {
    e.preventDefault();

    if (!startTime || finished) {
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