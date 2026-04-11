const menuDrawer = document.querySelector("#menu-drawer");
const overlay = document.querySelector("#overlay");
const menuButtons = Array.from(document.querySelectorAll("[data-toggle-menu]"));

let menuOpen = false;

function setMenuOpen(nextValue) {
  menuOpen = nextValue;
  menuDrawer?.classList.toggle("open", nextValue);
  menuDrawer?.setAttribute("aria-hidden", String(!nextValue));
  menuButtons.forEach((button) => button.setAttribute("aria-expanded", String(nextValue)));
  if (overlay) overlay.hidden = !nextValue;
}

document.addEventListener("click", (event) => {
  const toggleMenuTrigger = event.target.closest("[data-toggle-menu]");
  if (toggleMenuTrigger) {
    setMenuOpen(!menuOpen);
  }
});

overlay?.addEventListener("click", () => {
  setMenuOpen(false);
});
