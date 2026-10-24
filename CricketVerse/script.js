let total = 0;
let wickets = 0;
let balls = 0;
let innings = 1;
let limit = 12;
let batting = true;
let firstScore = 0;
let ended = false;

const $ = selector => document.querySelector(selector);

function update() {
  $("#runs").textContent = `${total}/${wickets}`;
  $("#overs").textContent =
    `${Math.floor(balls / 6)}.${balls % 6} overs`;
  $("#innings").textContent =
    innings === 1 ? "FIRST INNINGS" : "SECOND INNINGS";
}

function toss() {
  const won = Math.random() < 0.5;
  $("#target").textContent = won ? "You won the toss!" : "You lost the toss!";
  $("#result").textContent = won
    ? "Choose your strategy"
    : "Choose your strategy";
  $("#choice").classList.remove("hidden");
  $("#toss").disabled = true;
}

function start(choice) {
  batting = choice === "bat";
  $("#setup").classList.add("hidden");
  $("#game").classList.remove("hidden");
  $("#prompt").textContent = batting
    ? "Choose your shot"
    : "Choose your delivery";
  $("#commentary").textContent = batting
    ? "You are batting. Pick a shot!"
    : "You are bowling. Pick a number!";
}

function finish() {
  ended = true;

  if (innings === 1) {
    firstScore = total;
    $("#prompt").textContent = `Innings complete: ${firstScore}`;
    $("#next").classList.remove("hidden");
    document.querySelectorAll("[data-run]").forEach(b => b.disabled = true);
    $("#commentary").textContent = "Switch innings to chase the score.";
  } else {
    const message = total > firstScore
      ? "You won the match!"
      : total === firstScore
      ? "Match tied!"
      : "Computer wins this time!";

    $("#prompt").textContent = "MATCH OVER";
    $("#commentary").textContent = message;
    $("#result").textContent = message;
  }
}

$("#toss").onclick = toss;

document.querySelectorAll("[data-choice]").forEach(button => {
  button.onclick = () => start(button.dataset.choice);
});

document.querySelectorAll("[data-run]").forEach(button => {
  button.onclick = () => {
    if (ended) return;

    const shot = button.dataset.run;
    const delivery = Math.floor(Math.random() * 7);

    if (shot === "W" || Number(shot) === delivery) {
      wickets++;
      $("#commentary").textContent = "OUT! The bowler wins this ball.";
    } else if (batting) {
      total += Number(shot);
      $("#commentary").textContent =
        Number(shot) === 4 ? "FOUR! Boundary!" :
        Number(shot) === 6 ? "SIX! Into the stands!" :
        `You scored ${shot} run(s).`;
    } else {
      if (delivery === 4 || delivery === 6) {
        total += delivery;
        $("#commentary").textContent = `Computer hits ${delivery}!`;
      } else {
        $("#commentary").textContent = "Dot ball! Nice bowling.";
      }
    }

    balls++;
    update();

    if (wickets >= 10 || balls >= limit) finish();
  };
});

$("#next").onclick = () => {
  innings = 2;
  total = 0;
  wickets = 0;
  balls = 0;
  ended = false;
  batting = !batting;

  $("#next").classList.add("hidden");
  document.querySelectorAll("[data-run]").forEach(b => b.disabled = false);

  $("#prompt").textContent = batting ? "Chase the target!" : "Defend the target!";
  $("#commentary").textContent = `Target: ${firstScore + 1}`;
  $("#target").textContent = `Target: ${firstScore + 1}`;
  update();
};

$("#restart").onclick = () => location.reload();