const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYear = document.querySelector("#current-year");

currentYear.textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.querySelector(".menu-toggle-label").textContent = isExpanded ? "Open menu" : "Close menu";
  navigation.classList.toggle("is-open", !isExpanded);
});

const closeNavigation = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".menu-toggle-label").textContent = "Open menu";
  navigation.classList.remove("is-open");
};

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
    menuToggle.focus();
  }
});
