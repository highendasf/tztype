const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast takes practice and patience",
  "JavaScript makes websites interactive",
  "Practice every day to improve your speed"
];

let startTime, timerInterval, currentSentence = "";

function startGame() {
  currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
  const sentenceEl = document.getElementById("sentence");

  // 🧩 Split sentence into letters
  sentenceEl.innerHTML = currentSentence
    .split("")
    .map(letter => `<span>${letter}</span>`)
    .join("");

  const input = document.getElementById("input");
  input.value = "";
  input.disabled = false;
  input.focus();

  startTime = new Date().getTime();

  clearInterval(timerInterval);
  timerInterval = setInterval(updateTime, 1000);

  input.addEventListener("input", checkTyping);
}

function updateTime() {
  const seconds = Math.floor((new Date().getTime() - startTime) / 1000);
  document.getElementById("time").innerText = seconds;
}

function checkTyping() {
  const input = document.getElementById("input").value;
  const letters = document.querySelectorAll("#sentence span");

  let correct = true;

  letters.forEach((span, index) => {
    const typedChar = input[index];

    if (typedChar == null) {
      span.classList.remove("correct", "wrong");
      correct = false;
    } 
    else if (typedChar === span.innerText) {
      span.classList.add("correct");
      span.classList.remove("wrong");
    } 
    else {
      span.classList.add("wrong");
      span.classList.remove("correct");
      correct = false;
    }
  });

  // ✅ Finished typing
  if (input === currentSentence) {
    clearInterval(timerInterval);

    const totalTime = (new Date().getTime() - startTime) / 1000;
    const wordCount = currentSentence.split(" ").length;
    const wpm = Math.round((wordCount / totalTime) * 60);

    document.getElementById("wpm").innerText = wpm;
  }
}