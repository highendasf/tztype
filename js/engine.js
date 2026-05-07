let typed = "";
let sentence = "";
let start = null;
let mode = "words";

let wpmHistory = [];
let accHistory = [];

let smoothWPM = 0;
let smoothACC = 100;

function startGame() {

  const words = ["apple","code","speed","focus","keyboard"];

  const sentences = [
    "practice typing daily",
    "speed comes with accuracy"
  ];

  if (mode === "words") {
    sentence = Array.from({length: 10}, () =>
      words[Math.floor(Math.random()*words.length)]
    ).join(" ");

  } else if (mode === "sentences") {
    sentence = sentences[Math.floor(Math.random()*sentences.length)];

  } else {
    sentence = words[Math.floor(Math.random()*words.length)];
  }

  typed = "";
  start = Date.now();

  render();
  updateUI();
}

function inputKey(key) {

  if (!start) startGame();

  if (key === "BACK") typed = typed.slice(0,-1);
  else typed += key;

  updateUI();
}

function getWPM() {
  const t = (Date.now()-start)/1000 || 1;
  const raw = (typed.length/5)/(t/60);

  smoothWPM += (raw-smoothWPM)*0.1;
  return Math.round(smoothWPM);
}

function getACC() {

  let c = 0;
  for (let i=0;i<typed.length;i++)
    if (typed[i] === sentence[i]) c++;

  let raw = typed.length ? (c/typed.length)*100 : 100;

  smoothACC += (raw-smoothACC)*0.1;
  return Math.round(smoothACC);
}