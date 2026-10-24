document.querySelectorAll(".planet").forEach(planet => {
  planet.onclick = () => {
    document.querySelector("#name").textContent = planet.dataset.name;
    document.querySelector("#details").textContent = planet.dataset.info;
  };
});

document.querySelector("#toggle").onclick = () => {
  const space = document.querySelector(".space");
  space.classList.toggle("paused");

  document.querySelector("#toggle").textContent =
    space.classList.contains("paused") ? "Resume orbit" : "Pause orbit";
};