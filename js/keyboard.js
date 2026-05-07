function buildKeyboard() {

  const layout = [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["z","x","c","v","b","n","m"]
  ];

  const kb = document.getElementById("keyboard");
  if (!kb) return;

  kb.innerHTML = "";

  layout.forEach(row => {

    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";

    row.forEach(key => {

      const btn = document.createElement("button");
      btn.className = "kb-key";
      btn.textContent = key;

      btn.addEventListener("click", () => {
        if (typeof window.handleInput === "function") {
          window.handleInput(key);
        }
      });

      rowEl.appendChild(btn);
    });

    kb.appendChild(rowEl);
  });

  /* SPECIAL KEYS */
  const special = document.createElement("div");
  special.className = "kb-row";

  const space = document.createElement("button");
  space.className = "kb-key wide";
  space.textContent = "space";
  space.onclick = () => window.handleInput?.(" ");

  const back = document.createElement("button");
  back.className = "kb-key wide";
  back.textContent = "⌫";
  back.onclick = () => window.handleInput?.("BACK");

  special.appendChild(space);
  special.appendChild(back);

  kb.appendChild(special);
}

/* toggle visibility */
function toggleKeyboard() {
  const kb = document.getElementById("keyboard");
  if (!kb) return;

  kb.style.display =
    kb.style.display === "none" ? "block" : "none";
}

/* INIT HOOK */
window.addEventListener("load", buildKeyboard);

/* GLOBAL ACCESS (IMPORTANT) */
window.buildKeyboard = buildKeyboard;
window.toggleKeyboard = toggleKeyboard;