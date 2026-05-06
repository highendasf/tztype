console.log("Typing App Loaded ✔");

/* STATE */
let typedText = "";
let currentSentence = "";
let startTime = null;
let finished = false;
let mode = "sentence";

/* DATA */
const words = ["the","quick","brown","fox","jumps","typing","speed","code","learn","focus"];

const sentences = [
  "the quick brown fox jumps over the lazy dog",
  "practice typing every day",
  "javascript makes websites interactive",
  "focus on accuracy before speed",
  "clean code is better than clever code"
];

/* INIT */
window.onload = () => {
  setupMode();
  buildKeyboard();
};

/* MODE */
function setupMode() {
  document.getElementById("sentenceModeBtn").onclick = () => mode = "sentence";
  document.getElementById("wordModeBtn").onclick = () => mode = "word";
}

/* START */
function startGame() {
  finished = false;

  currentSentence =
    mode === "word"
      ? generateWords(12)
      : sentences[Math.floor(Math.random() * sentences.length)];

  typedText = "";
  startTime = Date.now();

  document.getElementById("sentence").innerText = currentSentence;
  updateTyped();
}

/* WORD GEN */
function generateWords(n) {
  let out = [];
  for (let i = 0; i < n; i++) {
    out.push(words[Math.floor(Math.random() * words.length)]);
  }
  return out.join(" ");
}

/* INPUT */
function pressKey(key) {
  if (finished) return;

  if (!startTime) startGame();

  if (key === "⌫") typedText = typedText.slice(0, -1);
  else if (key === "SPACE") typedText += " ";
  else typedText += key;

  updateTyped();

  if (typedText === currentSentence) {
    finishGame();
    finished = true;
  }
}

/* DISPLAY */
function updateTyped() {
  document.getElementById("typed").innerText = typedText;
}

/* FINISH */
function finishGame() {
  const time = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedText.length / 5) / (time / 60));

  document.getElementById("wpm").innerText = wpm;
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

/* KEYBOARD INPUT */
document.addEventListener("keydown", (e) => {
  if (finished) return;

  if (e.key === "Backspace") return pressKey("⌫");

  if (e.key === " ") {
    e.preventDefault();
    return pressKey("SPACE");
  }

  if (e.key.length === 1) {
    pressKey(e.key.toLowerCase());
  }
});

/* TOGGLE KEYBOARD */
function toggleKeyboard() {
  document.getElementById("keyboard").classList.toggle("hidden");
}

document.getElementById("toggleKeyboardBtn").onclick = toggleKeyboard;

/* TAB SHORTCUT */
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    toggleKeyboard();
  }
});