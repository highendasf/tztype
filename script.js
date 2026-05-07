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

  if (mode === "words") {
    currentSentence = Array.from({ length: 12 }, () =>
      words[Math.floor(Math.random() * words.length)]
    ).join(" ");

  } else if (mode === "sentences") {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  } else if (mode === "oneword") {
    currentSentence = words[Math.floor(Math.random() * words.length)];

  } else {
    currentSentence = Array.from({ length: 25 }, () =>
      words[Math.floor(Math.random() * words.length)]
    ).join(" ");
  }

  typedText = "";
  startTime = Date.now();

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
  document.getElementById("sentence").innerHTML =
    currentSentence.split("")
      .map(c => c === " "
        ? `<span class="space">·</span>`
        : `<span class="letter">${c}</span>`
      ).join("");
}

/* =========================
   PHYSICAL KEY INPUT
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

  document.getElementById("typed").innerText = typedText;

  const wpm = getWPM();
  const acc = getAcc();

  document.getElementById("wpm").innerText = wpm;
  document.getElementById("accuracy").innerText = acc;

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

    if (typed === expected) el.classList.add("correct");
    else el.classList.add("wrong");
  });
}

/* =========================
   WPM (SMOOTH)
========================= */
function getWPM() {

  const time = Math.max((Date.now() - startTime) / 1000, 0.5);

  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.1;

  return Math.max(0, Math.round(smoothWPM));
}

/* =========================
   ACCURACY (SMOOTH)
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
   GRAPH
========================= */
function drawGraph() {

  const c = document.getElementById("wpmChart");
  if (!c) return;

  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 160;

  ctx.clearRect(0, 0, c.width, c.height);

  wpmHistory.push(getWPM());
  accuracyHistory.push(getAcc());

  if (wpmHistory.length > 60) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accuracyHistory, "#2196f3");
}

/* =========================
   GRAPH LINE
========================= */
function drawLine(data, color) {

  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  if (data.length < 2) return;

  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {

    const x = (i / (data.length - 1)) * c.width;
    const y = c.height - (data[i] / 120) * c.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* =========================
   MENU
========================= */
function toggleMenu(el) {
  document.querySelector(".sidebar")?.classList.toggle("show");
  el?.classList.toggle("active");
}

/* =========================
   MODE SWITCH
========================= */
function toggleMode() {

  if (mode === "words") mode = "sentences";
  else if (mode === "sentences") mode = "oneword";
  else if (mode === "oneword") mode = "pro";
  else mode = "words";

  startGame();
}

/* =========================
   PAGE SWITCH
========================= */
function showPage(p) {

  const g = document.getElementById("gamePage");
  const h = document.getElementById("historyPage");

  if (!g || !h) return;

  g.style.display = p === "game" ? "block" : "none";
  h.style.display = p === "history" ? "block" : "none";
}

/* =========================
   KEYBOARD SYSTEM (FULL FIX)
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

  /* SPACE + BACKSPACE */
  const special = document.createElement("div");
  special.className = "row";

  const space = document.createElement("div");
  space.className = "key wide";
  space.innerText = "SPACE";
  space.onclick = () => {
    if (finished) return;
    if (!startTime) startGame();

    typedText += " ";
    update();
  };

  const back = document.createElement("div");
  back.className = "key wide";
  back.innerText = "⌫";
  back.onclick = () => {
    if (finished) return;

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