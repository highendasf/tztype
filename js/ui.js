function setMode(m) {
  mode = m;
  startGame();
}

function toggleMenu(btn) {
  document.body.classList.toggle("menu");
  btn.classList.toggle("active");
}

function updateUI() {

  document.getElementById("typed").innerText = typed;
  document.getElementById("wpm").innerText = getWPM();
  document.getElementById("accuracy").innerText = getACC();
}