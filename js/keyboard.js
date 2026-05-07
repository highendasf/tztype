function buildKeyboard() {

  const keys = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ];

  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";

  keys.forEach(row => {

    const r = document.createElement("div");
    r.className = "row";

    row.forEach(k => {

      const key = document.createElement("button");
      key.innerText = k;

      key.onclick = () => inputKey(k.toLowerCase());

      r.appendChild(key);
    });

    kb.appendChild(r);
  });

  const special = document.createElement("div");

  const space = document.createElement("button");
  space.innerText = "SPACE";
  space.onclick = () => inputKey(" ");

  const back = document.createElement("button");
  back.innerText = "⌫";
  back.onclick = () => inputKey("BACK");

  special.appendChild(space);
  special.appendChild(back);

  kb.appendChild(special);
}

function toggleKeyboard() {

  const kb = document.getElementById("keyboard");

  kb.style.display =
    kb.style.display === "none" ? "block" : "none";
}