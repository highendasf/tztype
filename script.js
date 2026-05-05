console.log("SCRIPT LOADED ✔");

let typedText = "";
let currentSentence = "";
let startTime;
let timer;

let capsLock = false;
let highScore = localStorage.getItem("highScore") || 0;

window.onload = () => {
  document.getElementById("highScore").innerText = highScore;

  // ✅ FORCE CHECK KEYBOARD EXISTS
  const kb = document.getElementById("keyboard");
  if (!kb) {
    console.error("❌ Keyboard DIV missing!");
  } else {
    console.log("✅ Keyboard found");
  }
};

const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast takes practice and patience",
  "Coding improves with practice every day",
  "Focus and accuracy matter more than speed"
];

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  document.getElementById("sentence").innerHTML =
    currentSentence.split("").map(c => `<span>${c}</span>`).join("");

  typedText = "";
  updateTyped();

  startTime = Date.now();
  clearInterval(timer);

  timer = setInterval(() => {
    document.getElementById("time").innerText =
      Math.floor((Date.now() - startTime) / 1000);
  }, 1000);
}

function updateTyped() {
  document.getElementById("typed").innerText = typedText;
  check();
}

function check() {
  const letters = document.querySelectorAll("#sentence span");

  letters.forEach((span, i) => {
    span.classList.remove("correct", "wrong");

    if (!typedText[i]) return;

    if (typedText[i] === span.innerText) {
      span.classList.add("correct");
    } else {
      span.classList.add("wrong");
    }
  });

  if (typedText === currentSentence) {
    finish();
  }
}

function finish() {
  clearInterval(timer);

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

/* ⌨️ KEYBOARD (FORCED RENDER SAFE) */
const layout = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"]
];

const keyboard = document.getElementById("keyboard");

// ✅ HARD CHECK (fixes "not showing" bug)
if (keyboard) {

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    row.forEach(letter => {
      const key = document.createElement("div");
      key.className = "key";
      key.innerText = letter;

      key.onclick = () => {
        const char = capsLock ? letter.toUpperCase() : letter.toLowerCase();
        typedText += char;
        updateTyped();
      };

      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });

  // bottom row
  const bottom = document.createElement("div");
  bottom.className = "row";

  const space = document.createElement("div");
  space.className = "key wide";
  space.innerText = "SPACE";
  space.onclick = () => {
    typedText += " ";
    updateTyped();
  };

  const back = document.createElement("div");
  back.className = "key wide";
  back.innerText = "⌫";
  back.onclick = () => {
    typedText = typedText.slice(0, -1);
    updateTyped();
  };

  const caps = document.createElement("div");
  caps.className = "key wide";
  caps.innerText = "CAPS";

  caps.onclick = () => {
    capsLock = !capsLock;
    caps.innerText = capsLock ? "CAPS ON" : "CAPS OFF";
  };

  bottom.appendChild(space);
  bottom.appendChild(back);
  bottom.appendChild(caps);

  keyboard.appendChild(bottom);

} else {
  console.error("Keyboard not found in DOM!");
}

/* physical keyboard */
document.addEventListener("keydown", (e) => {
  if (!currentSentence) return;

  if (e.key === "Backspace") {
    typedText = typedText.slice(0, -1);
    updateTyped();
  } else if (e.key === " ") {
    e.preventDefault();
    typedText += " ";
    updateTyped();
  } else if (e.key.length === 1) {
    typedText += capsLock ? e.key.toUpperCase() : e.key.toLowerCase();
    updateTyped();
  }
});