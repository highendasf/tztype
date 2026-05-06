let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;

let mode = "words";

let wpmHistory = [];
let accuracyHistory = [];

let smoothWPM = 0;
let smoothAcc = 100;

/* DATA */
const words = ["apple","banana","code","speed","typing","focus","keyboard"];

const sentences = [
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy first"
];

/* START */
function startGame() {
  finished = false;

  currentSentence =
    mode === "words"
      ? Array.from({ length: 12 }, () =>
          words[Math.floor(Math.random() * words.length)]
        ).join(" ")
      : sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  startTime = Date.now();

  render();
  update();
}

/* RENDER */
function render() {
  document.getElementById("sentence").innerHTML =
    currentSentence.split(" ").map(w =>
      `<span class="word">${w}</span>`
    ).join(" ");
}

/* INPUT */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (!startTime) startGame();

  if (e.key === "Backspace") {
    typedText = typedText.slice(0, -1);
  } else if (e.key === " ") {
    e.preventDefault();
    typedText += " ";
  } else if (e.key.length === 1) {
    typedText += e.key;
  }

  update();
});

/* UPDATE */
function update() {
  document.getElementById("typed").innerText = typedText;

  document.getElementById("wpm").innerText = getWPM();
  document.getElementById("accuracy").innerText = getAcc();

  highlight();
}

/* FIXED HIGHLIGHT */
function highlight() {
  const wordsEl = document.querySelectorAll(".word");
  const typedWords = typedText.split(" ");

  wordsEl.forEach((el, i) => {
    if (typedWords[i] === undefined) return;

    if (typedWords[i] === el.innerText) {
      el.style.color = "#4caf50";
    } else {
      el.style.color = "#ff4d4d";
    }
  });
}

/* WPM */
function getWPM() {
  const time = (Date.now() - startTime) / 1000;
  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.1;

  return Math.round(smoothWPM || 0);
}

/* ACCURACY */
function getAcc() {
  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentSentence[i]) correct++;
  }

  let acc = typedText.length
    ? (correct / typedText.length) * 100
    : 100;

  smoothAcc += (acc - smoothAcc) * 0.1;

  return Math.round(smoothAcc);
}

/* GRAPH (FIXED) */
function drawGraph() {
  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 150;

  ctx.clearRect(0,0,c.width,c.height);

  const wpm = getWPM();
  const acc = getAcc();

  wpmHistory.push(wpm);
  accuracyHistory.push(acc);

  if (wpmHistory.length > 100) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accuracyHistory, "#2196f3");

  requestAnimationFrame(drawGraph);
}

/* GRAPH DRAW */
function drawLine(data, color) {
  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  ctx.beginPath();
  ctx.strokeStyle = color;

  data.forEach((v,i)=>{
    const x = (i/(data.length-1))*c.width;
    const y = c.height - (v/100)*c.height;
    ctx.lineTo(x,y);
  });

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
  startGame();
}

/* INIT */
window.onload = startGame;
setInterval(drawGraph, 500);