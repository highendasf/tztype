let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let cursorIndex = 0;

let mode = "words";
let menuOpen = true;

let highScore = localStorage.getItem("highScore") || 0;

let wpmHistory = [];
let accuracyHistory = [];

let smoothWPM = 0;
let smoothAcc = 100;

let animationFrame;

/* DATA */
const wordBank = ["apple","banana","keyboard","typing","speed","code","focus","react"];
const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day",
  "javascript makes websites interactive"
];

/* START */
function startGame() {
  finished = false;

  currentSentence = mode === "words"
    ? Array.from({ length: 15 }, () =>
        wordBank[Math.floor(Math.random() * wordBank.length)]
      ).join(" ")
    : sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  cursorIndex = 0;
  startTime = Date.now();

  renderSentence();
  updateTyped();

  wpmHistory = [];
  accuracyHistory = [];

  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(drawGraph);
}

/* RENDER */
function renderSentence() {
  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(w =>
      `<span class="word">${w}</span>`
    ).join(" ");
}

/* FIXED HIGHLIGHT */
function highlight() {
  const words = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  words.forEach((w, i) => {
    const typed = typedWords[i] || "";

    if (!typed) return;

    if (typed !== w.innerText) {
      w.style.color = "#ff4d4d";
    } else {
      w.style.color = "#4caf50";
    }
  });
}

/* WPM */
function getWPM() {
  const time = (Date.now() - startTime) / 1000;
  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.08;
  return Math.round(smoothWPM);
}

/* ACCURACY */
function getAccuracy() {
  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentSentence[i]) correct++;
  }

  let raw = typedText.length
    ? (correct / typedText.length) * 100
    : 100;

  smoothAcc += (raw - smoothAcc) * 0.1;
  return Math.round(smoothAcc);
}

/* INPUT */
function pressKey(k) {
  if (finished) return;

  if (!startTime) startGame();

  if (k === "⌫") typedText = typedText.slice(0, -1);
  else if (k === "SPACE") typedText += " ";
  else typedText += k;

  updateTyped();
}

/* UPDATE */
function updateTyped() {
  document.getElementById("wpm").innerText = getWPM();
  document.getElementById("accuracy").innerText = getAccuracy();
  document.getElementById("highScore").innerText = highScore;

  highlight();
}

/* GRAPH FIXED */
function drawGraph() {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = 170;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const wpm = getWPM();
  const acc = getAccuracy();

  wpmHistory.push(wpm);
  accuracyHistory.push(acc);

  if (wpmHistory.length > 120) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  drawArea(wpmHistory, 100, "#4caf50", "rgba(76,175,80,0.3)");
  drawArea(accuracyHistory, 100, "#2196f3", "rgba(33,150,243,0.3)");

  animationFrame = requestAnimationFrame(drawGraph);
}

/* GRAPH DRAW */
function drawArea(data, max, stroke, fill) {
  const canvas = document.getElementById("wpmChart");
  const ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.moveTo(0, canvas.height);

  data.forEach((v,i)=>{
    const x = (i/(data.length-1))*canvas.width;
    const y = canvas.height - (v/max)*canvas.height;
    ctx.lineTo(x,y);
  });

  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();

  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/* MENU */
function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("hide");
}

/* PAGE */
function showPage(p) {
  document.getElementById("gamePage").style.display = p==="game"?"block":"none";
  document.getElementById("historyPage").style.display = p==="history"?"block":"none";
}

/* MODE */
function toggleMode() {
  mode = mode === "words" ? "sentences" : "words";
  document.getElementById("modeLabel").innerText = mode;
  startGame();
}

/* INIT */
window.onload = startGame;