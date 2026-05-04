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

let startTime, timerInterval, currentSentence = "";

// 🏆 Load high score
let highScore = localStorage.getItem("highScore") || 0;

window.onload = () => {
  document.getElementById("highScore").innerText = highScore;
};

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];

  document.getElementById("sentence").innerHTML =
    currentSentence.split("").map(c => `<span>${c}</span>`).join("");

  const input = document.getElementById("input");

  input.value = "";
  input.disabled = false;

  // 🔥 FORCE disable autocorrect behavior
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");

  input.focus();

  startTime = Date.now();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTime, 1000);
}

document.getElementById("input").addEventListener("input", checkTyping);

function updateTime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("time").innerText = seconds;
}

function checkTyping() {
  const input = document.getElementById("input").value;
  const letters = document.querySelectorAll("#sentence span");

  letters.forEach((span, i) => {
    const char = input[i];

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

  if (input === currentSentence) {
    clearInterval(timerInterval);

    const time = (Date.now() - startTime) / 1000;
    const words = currentSentence.split(" ").length;
    const wpm = Math.round((words / time) * 60);

    document.getElementById("wpm").innerText = wpm;

    // 🏆 Save high score
    if (wpm > highScore) {
      highScore = wpm;
      localStorage.setItem("highScore", highScore);
      document.getElementById("highScore").innerText = highScore;
    }
  }
}