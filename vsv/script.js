let secret;
let attempts;
let xp = 0;
let level = 1;

const $ = selector => document.querySelector(selector);

function newGame() {
  secret = "";

  while (secret.length < 3) {
    const digit = Math.floor(Math.random() * 10).toString();

    if (!secret.includes(digit)) {
      secret += digit;
    }
  }

  attempts = 8;
  $("#history").innerHTML =
    '<p class="system">New vault initialized. Enter a 3-digit code.</p>';

  $("#feedback").textContent = "Attempts remaining: 8";
  $("#guess").value = "";
  $("#form").querySelector("button").disabled = false;
}

$("#form").addEventListener("submit", event => {
  event.preventDefault();

  const guess = $("#guess").value;

  if (!/^\d{3}$/.test(guess) || new Set(guess).size !== 3) {
    $("#feedback").textContent = "Enter three different digits.";
    return;
  }

  let exact = 0;
  let misplaced = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else if (secret.includes(guess[i])) {
      misplaced++;
    }
  }

  const row = document.createElement("p");
  row.className = "entry";
  row.textContent =
    `> ${guess} — ${exact} exact, ${misplaced} misplaced`;

  $("#history").append(row);
  $("#history").scrollTop = $("#history").scrollHeight;

  attempts--;

  if (exact === 3) {
    xp += 100;
    level++;

    $("#xp").textContent = xp;
    $("#level").textContent = String(level).padStart(2, "0");
    $("#feedback").textContent = "Vault unlocked! +100 XP";
    $("#form").querySelector("button").disabled = true;
  } else if (attempts <= 0) {
    $("#feedback").textContent = `Vault locked. Secret was ${secret}`;
    $("#form").querySelector("button").disabled = true;
  } else {
    $("#feedback").textContent = `Attempts remaining: ${attempts}`;
  }

  $("#guess").value = "";
});

$("#new").onclick = newGame;

newGame();