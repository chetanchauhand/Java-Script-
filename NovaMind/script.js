const chat = document.querySelector("#chat");
const input = document.querySelector("#message");

function reply(text) {
  const user = document.createElement("div");
  user.className = "bubble user";
  user.textContent = text;
  chat.append(user);

  const bot = document.createElement("div");
  bot.className = "bubble bot";

  const message = text.toLowerCase();

  if (message.includes("javascript")) {
    bot.textContent =
      "Learn variables, conditions, loops, functions, arrays and DOM events. Build a small project after each topic.";
  } else if (message.includes("project")) {
    bot.textContent =
      "Try a weather dashboard, quiz game, habit tracker, cricket game or animated galaxy explorer.";
  } else if (message.includes("week")) {
    bot.textContent =
      "Plan three important tasks each day, schedule breaks and review your progress every evening.";
  } else {
    bot.textContent =
      "Interesting idea! Break it into a small goal, list the steps, build a first version and test it.";
  }

  chat.append(bot);
  chat.scrollTop = chat.scrollHeight;
}

document.querySelector("#form").addEventListener("submit", event => {
  event.preventDefault();

  if (input.value.trim()) {
    reply(input.value.trim());
    input.value = "";
  }
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.onclick = () => {
    input.value = button.dataset.prompt;
    input.focus();
  };
});

document.querySelector("#theme").onclick = () => {
  document.body.classList.toggle("light");
};