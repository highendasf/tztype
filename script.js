/* =========================
   CORE STATE
========================= */

let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;

let mode = "words";

let wpmHistory = [];
let accuracyHistory = [];

let smoothWPM = 0;
let smoothAcc = 100;

let graphLoop = null;

let lastWPM = 0;
let lastAcc = 100;

let keyboardVisible = true;

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

  currentSentence =
    mode === "words"
      ? Array.from({ length: 12 }, () =>
          words[Math.floor(Math.random() * words.length)]
        ).join(" ")

      : mode === "sentences"
      ? sentences[Math.floor(Math.random() * sentences.length)]

      : mode === "oneword"
      ? words[Math.floor(Math.random() * words.length)]

      : Array.from({ length: 25 }, () =>
          words[Math.floor(Math.random() * words.length)]
        ).join(" ");

  wpmHistory = [];
  accuracyHistory = [];

  smoothWPM = 0;
  smoothAcc = 100;

  render();
  update();

  clearInterval(graphLoop);
  graphLoop = setInterval(drawGraph, 200);
}

/* =========================
   RENDER TEXT
========================= */

function render() {
  const el = document.getElementById("sentence");
  if (!el) return;

  el.innerHTML = currentSentence
    .split("")
    .map(c =>
      c === " "
        ? `<span class="space">·</span>`
        : `<span class="letter">${c}</span>`
    ).join("");
}

/* =========================
   INPUT (KEYBOARD)
========================= */

document.addEventListener("keydown", (e) => {

  if (finished) return;
  if (!currentSentence) return;
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

  lastWPM = getWPM();
  lastAcc = getAcc();

  const typedEl = document.getElementById("typed");
  if (typedEl) typedEl.innerText = typedText;

  const wpmEl = document.getElementById("wpm");
  if (wpmEl) wpmEl.innerText = lastWPM;

  const accEl = document.getElementById("accuracy");
  if (accEl) accEl.innerText = lastAcc;

  const modeEl = document.getElementById("modeText");
  if (modeEl) modeEl.innerText = mode;

  highlight();

  if (typedText === currentSentence) {
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
    const expected = currentSentence[i];

    el.classList.remove("correct","wrong","current");

    if (typed == null) {
      if (i === typedText.length) el.classList.add("current");
      return;
    }

    el.classList.add(typed === expected ? "correct" : "wrong");
  });
}

/* =========================
   WPM
========================= */

function getWPM() {

  const time = Math.max((Date.now() - startTime) / 1000, 0.5);
  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.1;

  return Math.max(0, Math.round(smoothWPM));
}

/* =========================
   ACCURACY
========================= */

function getAcc() {

  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentSentence[i]) correct++;
  }

  const raw = typedText.length
    ? (correct / typedText.length) * 100
    : 100;

  smoothAcc += (raw - smoothAcc) * 0.1;

  return Math.max(0, Math.round(smoothAcc));
}

/* =========================
   GRAPH (ULTRA SMOOTH + FIXED)
========================= */

function drawGraph() {

  const c = document.getElementById("wpmChart");
  if (!c) return;

  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 160;

  ctx.clearRect(0, 0, c.width, c.height);

  wpmHistory.push(lastWPM);
  accuracyHistory.push(lastAcc);

  if (wpmHistory.length > 70) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accuracyHistory, "#2196f3");
}

/* =========================
   GRAPH LINE (GRADIENT + SMOOTH CURVE)
========================= */

function drawLine(data, color) {

  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  if (data.length < 2) return;

  const step = c.width / (data.length - 1);

  /* FILL */
  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {

    const x = i * step;
    const y = c.height - (data[i] / 120) * c.height;

    if (i === 0) ctx.moveTo(x, y);
    else {

      const px = (i - 1) * step;
      const py = c.height - (data[i - 1] / 120) * c.height;

      const cx = (px + x) / 2;
      const cy = (py + y) / 2;

      ctx.quadraticCurveTo(px, py, cx, cy);
    }
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, c.height);

  gradient.addColorStop(0, color === "#4caf50"
    ? "rgba(76,175,80,0.45)"
    : "rgba(33,150,243,0.45)");

  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.lineTo(c.width, c.height);
  ctx.lineTo(0, c.height);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();

  /* LINE */
  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {

    const x = i * step;
    const y = c.height - (data[i] / 120) * c.height;

    if (i === 0) ctx.moveTo(x, y);
    else {

      const px = (i - 1) * step;
      const py = c.height - (data[i - 1] / 120) * c.height;

      const cx = (px + x) / 2;
      const cy = (py + y) / 2;

      ctx.quadraticCurveTo(px, py, cx, cy);
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* =========================
   MODE SWITCH (MAIN UI)
========================= */

function toggleMode() {

  if (mode === "words") mode = "sentences";
  else if (mode === "sentences") mode = "oneword";
  else mode = "words";

  startGame();
}

/* =========================
   KEYBOARD TOGGLE (MAIN UI)
========================= */

function toggleKeyboard() {

  const kb = document.getElementById("keyboard");
  if (!kb) return;

  keyboardVisible = !keyboardVisible;

  kb.style.display = keyboardVisible ? "block" : "none";

  const btn = document.getElementById("keyboardBtn");
  if (btn) btn.innerText = keyboardVisible ? "Hide Keyboard" : "Show Keyboard";
}

/* =========================
   KEYBOARD BUILDER
========================= */

function buildKeyboard() {

  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const kb = document.getElementById("keyboard");
  if (!kb) return;

  kb.innerHTML = "";

  layout.forEach(row => {

    const rowEl = document.createElement("div");
    rowEl.className = "row";

    row.forEach(key => {

      const keyEl = document.createElement("div");
      keyEl.className = "key";
      keyEl.innerText = key;

      keyEl.onclick = () => {

        if (finished) return;
        if (!startTime) startGame();

        typedText += key.toLowerCase();
        update();
      };

      rowEl.appendChild(keyEl);
    });

    kb.appendChild(rowEl);
  });

  const special = document.createElement("div");
  special.className = "row";

  const space = document.createElement("div");
  space.className = "key wide";
  space.innerText = "SPACE";
  space.onclick = () => {
    typedText += " ";
    update();
  };

  const back = document.createElement("div");
  back.className = "key wide";
  back.innerText = "⌫";
  back.onclick = () => {
    typedText = typedText.slice(0, -1);
    update();
  };

  special.appendChild(space);
  special.appendChild(back);

  kb.appendChild(special);
}

/* =========================
   INIT
========================= */

window.onload = () => {
  buildKeyboard();
  startGame();
};