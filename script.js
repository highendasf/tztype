let typedText = "";
let sentence = "";
let startTime = null;
let finished = false;

let mode = "words";

let wpmHistory = [];
let accHistory = [];

let smoothWPM = 0;
let smoothACC = 100;

let graphLoop = null;

/* =========================
   DATA
========================= */

const words = [
  "apple","banana","code","speed","typing","focus","keyboard",
  "practice","accuracy","javascript","gaming","monitor"
];

const sentences = [
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy first",
  "speed comes naturally with practice"
];

/* =========================
   START GAME
========================= */

function startGame() {

  finished = false;
  typedText = "";
  startTime = Date.now();

  if (mode === "words") {
    sentence = Array.from({ length: 12 }, () =>
      words[Math.floor(Math.random() * words.length)]
    ).join(" ");

  } else if (mode === "sentences") {
    sentence = sentences[Math.floor(Math.random() * sentences.length)];

  } else if (mode === "oneword") {
    sentence = words[Math.floor(Math.random() * words.length)];
  }

  wpmHistory = [];
  accHistory = [];

  smoothWPM = 0;
  smoothACC = 100;

  render();
  update();

  clearInterval(graphLoop);
  graphLoop = setInterval(drawGraph, 200);
}

/* =========================
   RENDER
========================= */

function render() {
  const el = document.getElementById("sentence");
  if (!el) return;

  el.innerHTML = sentence
    .split("")
    .map(c =>
      c === " "
        ? `<span class="space">·</span>`
        : `<span class="letter">${c}</span>`
    ).join("");
}

/* =========================
   INPUT
========================= */

document.addEventListener("keydown", (e) => {

  if (finished) return;

  if (!startTime) startGame();

  if (e.key === "Backspace") {
    typedText = typedText.slice(0, -1);
  } else if (e.key === " ") {
    e.preventDefault();
    typedText += " ";
  } else if (e.key.length === 1) {
    typedText += e.key.toLowerCase();
  }

  update();
});

/* =========================
   UPDATE UI
========================= */

function update() {

  const typedEl = document.getElementById("typed");
  if (typedEl) typedEl.innerText = typedText;

  document.getElementById("wpm").innerText = getWPM();
  document.getElementById("accuracy").innerText = getACC();

  highlight();

  if (typedText === sentence) {
    finished = true;
    clearInterval(graphLoop);
  }
}

/* =========================
   HIGHLIGHT
========================= */

function highlight() {

  const letters = document.querySelectorAll(".letter");

  letters.forEach((el, i) => {

    const typed = typedText[i];
    const expected = sentence[i];

    el.classList.remove("correct","wrong","current");

    if (typed == null) {
      if (i === typedText.length) el.classList.add("current");
      return;
    }

    el.classList.add(
      typed === expected ? "correct" : "wrong"
    );
  });
}

/* =========================
   WPM
========================= */

function getWPM() {

  const time = Math.max((Date.now() - startTime) / 1000, 0.5);
  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.1;

  return Math.round(smoothWPM);
}

/* =========================
   ACCURACY
========================= */

function getACC() {

  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === sentence[i]) correct++;
  }

  const raw = typedText.length
    ? (correct / typedText.length) * 100
    : 100;

  smoothACC += (raw - smoothACC) * 0.1;

  return Math.round(smoothACC);
}

/* =========================
   GRAPH
========================= */

function drawGraph() {

  const c = document.getElementById("wpmChart");
  if (!c) return;

  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 160;

  ctx.clearRect(0,0,c.width,c.height);

  wpmHistory.push(getWPM());
  accHistory.push(getACC());

  if (wpmHistory.length > 60) {
    wpmHistory.shift();
    accHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accHistory, "#2196f3");
}

/* =========================
   LINE
========================= */

function drawLine(data, color) {

  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  if (data.length < 2) return;

  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {

    const x = (i/(data.length-1)) * c.width;
    const y = c.height - (data[i]/120) * c.height;

    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* =========================
   MENU (FIXED GLOBAL ACCESS)
========================= */

function toggleMenu(btn) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  sidebar.classList.toggle("show");
  if (btn) btn.classList.toggle("active");
}

/* =========================
   MODE SWITCH
========================= */

function setMode(m) {

  if (m === "one") mode = "oneword";
  else mode = m;

  startGame();
}

/* =========================
   KEYBOARD TOGGLE
========================= */

function toggleKeyboard() {

  const kb = document.getElementById("keyboard");
  if (!kb) return;

  kb.style.display =
    kb.style.display === "none" ? "block" : "none";
}

/* =========================
   CRITICAL FIX: GLOBAL EXPORT
   (THIS FIXES YOUR ERROR)
========================= */

window.toggleMenu = toggleMenu;
window.setMode = setMode;
window.toggleKeyboard = toggleKeyboard;

/* =========================
   INIT
========================= */

window.onload = startGame;