const player = document.querySelector("#player");
const coin = document.querySelector("#coin");
const mission = document.querySelector("#mission");

let x = 45;
let y = 75;
let coins = 0;
let missions = 0;

function randomPosition(element) {
  element.style.left = (10 + Math.random() * 78) + "%";
  element.style.top = (15 + Math.random() * 65) + "%";
}

function place() {
  player.style.left = x + "%";
  player.style.top = y + "%";

  const coinX = parseFloat(coin.style.left || "70");
  const coinY = parseFloat(coin.style.top || "62");

  if (Math.abs(x - coinX) < 6 && Math.abs(y - coinY) < 9) {
    coins++;
    document.querySelector("#coins").textContent = coins;
    randomPosition(coin);
    document.querySelector("#status").textContent =
      "Coin collected! Keep exploring.";
  }

  const missionX = parseFloat(mission.style.left || "18");
  const missionY = parseFloat(mission.style.top || "58");

  if (Math.abs(x - missionX) < 7 && Math.abs(y - missionY) < 10) {
    missions++;
    document.querySelector("#missions").textContent = missions;
    randomPosition(mission);
    document.querySelector("#status").textContent =
      "Mission complete! Package delivered.";
  }
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (["arrowup", "w"].includes(key)) y -= 3;
  if (["arrowdown", "s"].includes(key)) y += 3;
  if (["arrowleft", "a"].includes(key)) x -= 3;
  if (["arrowright", "d"].includes(key)) x += 3;

  x = Math.max(2, Math.min(90, x));
  y = Math.max(4, Math.min(82, y));

  place();
});

document.querySelector("#reset").onclick = () => location.reload();