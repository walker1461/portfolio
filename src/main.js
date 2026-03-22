import './style.css'
const menuButton = document.getElementById("menu-button")
const mobileMenu = document.getElementById("mobile-menu-main")
const canvas = document.getElementById("wave-canvas")
const ctx = canvas.getContext("2d")
const gridCanvas = document.getElementById("grid-canvas")
const gridCtx = gridCanvas.getContext("2d")
const disableBtn = document.getElementById("disable-waves-btn")

function openMenu() {
  mobileMenu.classList.remove("hidden")
  menuButton.textContent = ""
}

function closeMenu() {
  mobileMenu.classList.add("hidden")
  menuButton.textContent = "☰"
}

function toggleMenu() {
  if (mobileMenu.classList.contains("hidden")) {
    openMenu()
  } else {
    closeMenu()
  }
}

menuButton?.addEventListener("click", (e) => {
  e.stopPropagation() // prevent outside click from firing
  toggleMenu()
})

mobileMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu)
})

document.addEventListener("click", (e) => {
  const isClickInsideMenu = mobileMenu.contains(e.target)
  const isClickButton = menuButton.contains(e.target)

  if (!isClickInsideMenu && !isClickButton) {
    closeMenu()
  }
})

disableBtn.addEventListener("click", () => {
  canvas.classList.toggle("hidden")
  if (canvas.classList.contains("hidden")) {
    disableBtn.textContent = "enable motion graphics"
  } else {
    disableBtn.textContent = "disable motion graphics"
  }
})

const isMobile = window.innerWidth < 768
const waveCount = isMobile ? 3 : 5
const steps = isMobile ? 8 : 4

function resize() {
  const dpr = isMobile ? 1 : window.devicePixelRatio || 1
  const width = window.innerWidth
  const height = window.innerHeight

  canvas.width = width * dpr
  canvas.height = height * dpr

  canvas.style.width = width + "px"
  canvas.style.height = height + "px"

  ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform
  ctx.scale(dpr, dpr)

  if (!isMobile) {
    buildGrid()
  }

  if (isMobile) {
    gridCanvas.style.display = "none"
  }

}
resize()

window.addEventListener("orientationchange", resize)
window.addEventListener("resize", resize)

let time = 0
let mouseX = window.innerWidth / 2
let mouseY = window.innerHeight / 2

if (!isMobile) {
  window.addEventListener("mousemove", e => {
    mouseX = e.clientX
    mouseY = e.clientY
  })
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

const waves = []
for (let i = 0; i < waveCount; i++) {
  waves.push({
    baseAmp: random(isMobile ? 15: 20, isMobile ? 55 : 82),
    freq: random(isMobile ? 0.02 : 0.008, isMobile ? 0.04 : 0.022),
    speed: random(isMobile ? 0.2 : 0.25, 0.38),
    drift: random(0.001, 0.01),
    offset: random(isMobile ? -30 : -50, isMobile ? 30 : 50),
    opacity: random(isMobile ? 0.2 : 0.18, isMobile ? 0.35 : 0.5),
    ripplePhase: random(0, Math.PI * 2),
    rippleStrength: random(30, 90),
    rippleDecay: random(120, 180),
    rippleSpeed: random(0.05, 0.16),
    ampModSpeed: random(0.002,0.01),
    freqModSpeed: random(0.002,0.008),
  })
}

// if (!isMobile) {
//   ctx.shadowBlur = 80
//   ctx.shadowColor = "rgba(255,255,255,0.8)"
// }

function buildGrid() {

  gridCanvas.width = canvas.width
  gridCanvas.height = canvas.height

  const gridSize = 80

  const centerX = gridCanvas.width / 2
  const centerY = gridCanvas.height / 2

  //const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
  const maxDx = Math.max(centerX, gridCanvas.width - centerX)
  const maxDy = Math.max(centerY, gridCanvas.height - centerY)
  const maxDist = Math.sqrt(maxDx * maxDx + maxDy * maxDy)

  gridCtx.lineWidth = 1

  for (let y = 0; y < gridCanvas.height; y += gridSize) {

    for (let x = 0; x < gridCanvas.width; x += gridSize) {

      const dx = x - centerX
      const dy = y - centerY

      const dist = Math.sqrt(dx * dx + dy * dy)
      const fade = Math.pow(Math.max(0, 1 - dist / maxDist), 2.5)
      //const verticalFade = 1 - (y / gridCanvas.height) * 0.6
      //const fade = Math.max(0, (1 - dist / maxDist) * verticalFade)

      gridCtx.strokeStyle = `rgba(255,255,255,${fade * 0.1})`

      gridCtx.strokeRect(x, y, gridSize, gridSize)
    }
  }
}

let lastTime = 0

function draw(now) {

  const delta = (now - lastTime) / 16.67
  lastTime = now
  //ctx.globalCompositeOperation = "source-over"
  ctx.clearRect(0,0,canvas.width,canvas.height)

  const width = window.innerWidth
  const height = window.innerHeight

  waves.forEach((wave) => {
    ctx.beginPath()
    //const pixelRatio = window.devicePixelRatio || 1
    //for (let x = 0; x < canvas.width / pixelRatio; x += steps) {
    for (let x = 0; x < width; x += steps) {
      const dx = x - mouseX
      const dy = mouseY - (height / 2)
      const verticalFactor = Math.max(0, 1 - Math.abs(dy)/150)

      const ripple =
        verticalFactor *
        Math.exp(-Math.abs(dx) / wave.rippleDecay) *
        wave.rippleStrength *
        Math.sin(time * wave.rippleSpeed - dx * 0.05 + wave.ripplePhase)

      const noise =
        Math.cos(x * 0.002 + time * 0.2) * 8 +
        Math.cos(x * 0.01 + time * 0.6) * 4

      const dynamicAmp =
        wave.baseAmp +
        Math.sin(time * wave.ampModSpeed) * 30

      const dynamicFreq =
        wave.freq +
        Math.sin(time * wave.freqModSpeed) * 0.002

      const y =
        //canvas.height / 2 +
        height / 2 +
        wave.offset +
        ripple +
        Math.sin(x * dynamicFreq + time * wave.speed) * dynamicAmp +
        Math.sin((time) * wave.drift) * 20 +
        noise
      //ctx.lineTo(x * pixelRatio, y * pixelRatio) // scale properly
      ctx.lineTo(x, y)
    }
  
    ctx.strokeStyle = `rgba(255,255,255,${wave.opacity})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  })

  time += 0.6 * delta
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)