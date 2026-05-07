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
let keyboardVisible = true;

/* DATA */
const words = [
  "apple","banana","code","speed","typing",
  "focus","keyboard","practice","accuracy",
  "javascript","gaming","monitor"
];

const sentences = [
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy first",
  "speed comes naturally with practice",
  "typing games improve keyboard memory"
];

/* START GAME */
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

  wpmHistory = [];
  accuracyHistory = [];

  smoothWPM = 0;
  smoothAcc = 100;

  render();
  update();

  if (graphLoop) clearInterval(graphLoop);

  graphLoop = setInterval(drawGraph, 200);
}

/* RENDER */
function render() {
  const sentenceEl = document.getElementById("sentence");

  sentenceEl.innerHTML = currentSentence
    .split("")
    .map(letter => {
      if (letter === " ") {
        return `<span class="letter space">·</span>`;
      }

      return `<span class="letter">${letter}</span>`;
    })
    .join("");
}

/* INPUT */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (!startTime) startGame();

  if (e.key === "Backspace") {
    typedText = typedText.slice(0, -1);
  }
  else if (e.key === " ") {
    e.preventDefault();
    typedText += " ";
  }
  else if (e.key.length === 1) {
    typedText += e.key.toLowerCase();
  }

  update();
});

/* UPDATE */
function update() {
  const typedEl = document.getElementById("typed");

  typedEl.innerHTML = typedText
    .split("")
    .map((char, i) => {
      const display = char === " " ? "·" : char;

      if (i === typedText.length - 1) {
        return `<span class="cursor">${display}</span>`;
      }

      return display;
    })
    .join("");

  document.getElementById("wpm").innerText = getWPM();
  document.getElementById("accuracy").innerText = getAcc();

  highlight();

  if (typedText === currentSentence) {
    finishGame();
  }
}

/* HIGHLIGHT */
function highlight() {
  const letters = document.querySelectorAll(".letter");

  letters.forEach((el, i) => {
    el.classList.remove("correct", "wrong", "current");

    const expected = currentSentence[i];
    const typed = typedText[i];

    if (typed == null) {
      if (i === typedText.length) {
        el.classList.add("current");
      }

      return;
    }

    if (typed === expected) {
      el.classList.add("correct");
    } else {
      el.classList.add("wrong");
    }
  });
}

/* FINISH */
function finishGame() {
  finished = true;

  clearInterval(graphLoop);
}

/* WPM */
function getWPM() {
  if (!startTime) return 0;

  const time = (Date.now() - startTime) / 1000;

  if (time <= 0) return 0;

  const raw = (typedText.length / 5) / (time / 60);

  smoothWPM += (raw - smoothWPM) * 0.08;

  return Math.max(0, Math.round(smoothWPM));
}

/* ACCURACY */
function getAcc() {
  let correct = 0;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === currentSentence[i]) {
      correct++;
    }
  }

  const raw =
    typedText.length > 0
      ? (correct / typedText.length) * 100
      : 100;

  smoothAcc += (raw - smoothAcc) * 0.08;

  return Math.max(0, Math.round(smoothAcc));
}

/* GRAPH */
function drawGraph() {
  const c = document.getElementById("wpmChart");

  if (!c) return;

  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 150;

  ctx.clearRect(0, 0, c.width, c.height);

  const wpm = getWPM();
  const acc = getAcc();

  wpmHistory.push(wpm);
  accuracyHistory.push(acc);

  if (wpmHistory.length > 60) {
    wpmHistory.shift();
    accuracyHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accuracyHistory, "#2196f3");
}

/* DRAW GRAPH LINE */
function drawLine(data, color) {
  const c = document.getElementById("wpmChart");
  const ctx = c.getContext("2d");

  if (data.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * c.width;
    const y = c.height - (v / 100) * c.height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

/* MENU */
function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("hide");
}

/* PAGE */
function showPage(page) {
  document.getElementById("gamePage").style.display =
    page === "game" ? "block" : "none";

  document.getElementById("historyPage").style.display =
    page === "history" ? "block" : "none";
}

/* MODE */
function toggleMode() {
  mode = mode === "words" ? "sentences" : "words";

  startGame();
}

/* KEYBOARD TOGGLE */
function toggleKeyboard() {
  const kb = document.getElementById("keyboard");

  keyboardVisible = !keyboardVisible;

  kb.style.display = keyboardVisible ? "block" : "none";
}

/* BUILD KEYBOARD */
function buildKeyboard() {
  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const kb = document.getElementById("keyboard");

  kb.innerHTML = "";

  layout.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "row";

    row.forEach(key => {
      const keyEl = document.createElement("div");

      keyEl.className = "key";
      keyEl.innerText = key;

      keyEl.onclick = () => {
        typedText += key.toLowerCase();
        update();
      };

      rowEl.appendChild(keyEl);
    });

    kb.appendChild(rowEl);
  });

  /* SPACE + BACKSPACE */
  const specialRow = document.createElement("div");
  specialRow.className = "row";

  ["SPACE", "⌫"].forEach(key => {
    const keyEl = document.createElement("div");

    keyEl.className = "key wide";
    keyEl.innerText = key;

    keyEl.onclick = () => {
      if (key === "SPACE") {
        typedText += " ";
      } else {
        typedText = typedText.slice(0, -1);
      }

      update();
    };

    specialRow.appendChild(keyEl);
  });

  kb.appendChild(specialRow);
}

/* INIT */
window.onload = () => {
  buildKeyboard();
  startGame();
};