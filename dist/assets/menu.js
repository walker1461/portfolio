const menuButton = document.getElementById("menu-button")
const mobileMenu = document.getElementById("mobile-menu")
const closeButton = document.getElementById("close-button")

function openMenu() {
  mobileMenu.classList.remove("hidden")
  menuButton.classList.add("invisible") // keeps layout, but hides icon
}

function closeMenu() {
  mobileMenu.classList.add("hidden")
  menuButton.classList.remove("invisible")
}

// Menu button opens
menuButton.addEventListener("click", openMenu)

// Close button closes
closeButton.addEventListener("click", closeMenu)

// Clicking any link closes menu
mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu)
})

// Optional: click outside the menu closes it
document.addEventListener("click", (e) => {
  const isMenuOpen = !mobileMenu.classList.contains("hidden")
  if (!isMenuOpen) return

  if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
    closeMenu()
  }
})