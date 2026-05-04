const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast takes practice and patience",
  "JavaScript makes websites interactive",
  "Practice every day to improve your speed",
  "Never stop learning new skills",
  "Coding is like solving puzzles",
  "Focus and accuracy matter more than speed",
  "Consistency beats motivation",
  "Debugging is part of programming",
  "Every expert was once a beginner"
];

let currentSentence = "";
let typedText = "";
let startTime, timerInterval;
let capsLock = false;

// 🏆 high score
let highScore = localStorage.getItem("highScore") || 0;

window.onload = () => {
  document.getElementById("highScore").innerText = highScore;
};

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  document.getElementById("sentence").innerHTML =
    currentSentence.split("").map(c => `<span>${c}</span>`).join("");

  typedText = "";
  updateTyped();

  startTime = Date.now();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTime, 1000);
}

function updateTime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("time").innerText = seconds;
}

function updateTyped() {
  document.getElementById("typed").innerText = typedText;
  checkTyping();
}

function checkTyping() {
  const letters = document.querySelectorAll("#sentence span");

  letters.forEach((span, i) => {
    const char = typedText[i];

    if (!char) {
      span.classList.remove("correct", "wrong");
    } else if (char === span.innerText) {
      span.classList.add("correct");
      span.classList.remove("wrong");
    } else {
      span.classList.add("wrong");
      span.classList.remove("correct");
    }
  });

  if (typedText === currentSentence) {
    clearInterval(timerInterval);

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
}

/* ⌨️ KEYBOARD */
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
      let char = capsLock ? letter : letter.toLowerCase();

      typedText += char;
      updateTyped();
    };

    rowDiv.appendChild(key);
  });

  keyboard.appendChild(rowDiv);
});

/* bottom row */
const bottomRow = document.createElement("div");
bottomRow.className = "row";

/* SPACE */
const space = document.createElement("div");
space.className = "key wide";
space.innerText = "SPACE";

space.onclick = () => {
  typedText += " ";
  updateTyped();
};

/* BACKSPACE */
const backspace = document.createElement("div");
backspace.className = "key wide";
backspace.innerText = "⌫";

backspace.onclick = () => {
  typedText = typedText.slice(0, -1);
  updateTyped();
};

/* CAPS LOCK */
const caps = document.createElement("div");
caps.className = "key wide";
caps.innerText = "CAPS";

caps.onclick = () => {
  capsLock = !capsLock;
  caps.innerText = capsLock ? "CAPS ON" : "CAPS";
};

bottomRow.appendChild(space);
bottomRow.appendChild(backspace);
bottomRow.appendChild(caps);

keyboard.appendChild(bottomRow);