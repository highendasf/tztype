let typedText = "";
let currentSentence = "";
let startTime;
let timer;

let capsLock = false;
let highScore = localStorage.getItem("highScore") || 0;

let correctChars = 0;
let totalChars = 0;

let wpmHistory = [];
let smoothHistory = [];
let graphTimer;
let animationFrame;

document.getElementById("highScore").innerText = highScore;

const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast takes practice and patience",
  "Coding improves with practice every day",
  "Focus and accuracy matter more than speed"
];

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(word =>
      `<span class="word">${word.split("").map(c => `<span>${c}</span>`).join("")}</span>`
    ).join(" ");

  typedText = "";
  updateTyped();

  startTime = Date.now();

  clearInterval(timer);
  timer = setInterval(() => {
    document.getElementById("time").innerText =
      Math.floor((Date.now() - startTime) / 1000);
  }, 1000);

  // graph start
  wpmHistory = [];
  smoothHistory = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animateGraph);

  clearInterval(graphTimer);
  graphTimer = setInterval(updateGraph, 1000);
}

function updateTyped() {
  document.getElementById("typed").innerText = typedText;
  check();
}

function check() {
  const words = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  correctChars = 0;
  totalChars = typedText.length;

  words.forEach((wordSpan, i) => {
    const letters = wordSpan.querySelectorAll("span");
    const typedWord = typedWords[i] || "";

    let correctWord = true;

    letters.forEach((letterSpan, j) => {
      letterSpan.classList.remove("correct", "wrong");

      const char = typedWord[j];

      if (!char) return;

      if (char === letterSpan.innerText) {
        letterSpan.classList.add("correct");
        correctChars++;
      } else {
        letterSpan.classList.add("wrong");
        correctWord = false;
      }
    });

    wordSpan.classList.remove("word-correct", "word-wrong");

    if (!typedWord) return;

    if (typedWord === wordSpan.innerText) {
      wordSpan.classList.add("word-correct");
    } else if (!correctWord || typedWord.length >= wordSpan.innerText.length) {
      wordSpan.classList.add("word-wrong");
    }
  });

  updateAccuracy();

  if (typedText === currentSentence) finishGame();
}

function updateAccuracy() {
  let acc = totalChars === 0 ? 100 :
    Math.round((correctChars / totalChars) * 100);

  document.getElementById("accuracy").innerText = acc;
}

function finishGame() {
  clearInterval(timer);
  clearInterval(graphTimer);
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

/* GRAPH */
function updateGraph() {
  const time = (Date.now() - startTime) / 1000;
  const words = typedText.trim().split(" ").length;
  const wpm = Math.round((words / time) * 60);

  wpmHistory.push(wpm);

  const last = smoothHistory.at(-1) || wpm;
  smoothHistory.push(last + (wpm - last) * 0.3);
}

function animateGraph() {
  drawGraph();
  animationFrame = requestAnimationFrame(animateGraph);
}

function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

/* KEYBOARD */
const layout = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"]
];

const keyboard = document.getElementById("keyboard");

layout.forEach(row => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";

  row.forEach(letter => {
    const key = document.createElement("div");
    key.className = "key";
    key.innerText = letter;

    key.onclick = () => {
      typedText += capsLock ? letter : letter.toLowerCase();
      updateTyped();
    };

    rowDiv.appendChild(key);
  });

  keyboard.appendChild(rowDiv);
});

const bottom = document.createElement("div");
bottom.className = "row";

["SPACE","⌫","CAPS"].forEach(type => {
  const key = document.createElement("div");
  key.className = "key wide";
  key.innerText = type;

  key.onclick = () => {
    if (type === "SPACE") typedText += " ";
    if (type === "⌫") typedText = typedText.slice(0,-1);
    if (type === "CAPS") capsLock = !capsLock;

    updateTyped();
  };

  bottom.appendChild(key);
});

keyboard.appendChild(bottom);

/* PHYSICAL KEYBOARD */
document.addEventListener("keydown", (e) => {
  if (!currentSentence) return;

  if (e.key === "Backspace") typedText = typedText.slice(0,-1);
  else if (e.key === " ") {
    e.preventDefault();
    typedText += " ";
  }
  else if (e.key.length === 1) {
    typedText += capsLock ? e.key.toUpperCase() : e.key.toLowerCase();
  }

  updateTyped();
});