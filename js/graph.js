function drawGraph() {

  const c = document.getElementById("graph");
  const ctx = c.getContext("2d");

  c.width = c.offsetWidth;
  c.height = 150;

  wpmHistory.push(getWPM());
  accHistory.push(getACC());

  if (wpmHistory.length > 80) {
    wpmHistory.shift();
    accHistory.shift();
  }

  drawLine(wpmHistory, "#4caf50");
  drawLine(accHistory, "#2196f3");
}

function drawLine(data, color) {

  const c = document.getElementById("graph");
  const ctx = c.getContext("2d");

  ctx.beginPath();

  data.forEach((v,i) => {

    const x = (i/(data.length-1))*c.width;
    const y = c.height - (v/120)*c.height;

    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}