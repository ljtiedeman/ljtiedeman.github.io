// Constants
const SHADES_COUNT = 10;
const MAX_ATTEMPTS = 5;
const COLORS = ['red', 'green', 'blue'];

// State variables
let targetColor = { r: 0, g: 0, b: 0 };
let selectedShades = { red: null, green: null, blue: null };
let lockedColors = { red: false, green: false, blue: false };
let attempts = 0;
let gameOver = false;

// DOM elements
const targetColorDiv = document.getElementById('target-color');
const submitBtn = document.getElementById('submit-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const previousGuessesDiv = document.getElementById('previous-guesses');
const guessResultDiv = document.getElementById('guess-result');

// Utility: Generate shades from lightest (index 0) to darkest (index 9)
function generateShades(colorName) {
  const shades = [];
  for (let i = 0; i < SHADES_COUNT; i++) {
    const intensity = Math.round((i * 255) / (SHADES_COUNT - 1));
    let r = 0, g = 0, b = 0;
    if (colorName === 'red') r = intensity;
    else if (colorName === 'green') g = intensity;
    else if (colorName === 'blue') b = intensity;
    shades.push(`rgb(${r},${g},${b})`);
  }
  return shades;
}

// Initialize selectors rows
function createColorSelectors() {
  COLORS.forEach(color => {
    const rowDiv = document.getElementById(color + '-row');
    const shades = generateShades(color);

    // Clear existing children (except label)
    while (rowDiv.children.length > 1) {
      rowDiv.removeChild(rowDiv.lastChild);
    }

    shades.forEach((shade, idx) => {
      const box = document.createElement('div');
      box.classList.add('color-box-shade');
      box.style.backgroundColor = shade;
      box.dataset.color = color;
      box.dataset.shadeIndex = idx;
      box.title = `${color.charAt(0).toUpperCase() + color.slice(1)} shade ${idx + 1}`;

      box.addEventListener('click', () => {
        if (gameOver) return;
        if (lockedColors[color]) return; // locked, no change allowed

        // Select this shade and update UI
        selectedShades[color] = idx;
        updateSelectorsUI();
        updateSubmitButton();
      });

      rowDiv.appendChild(box);
    });
  });
}

// Update selectors UI: border for selected, opacity for locked
function updateSelectorsUI() {
  COLORS.forEach(color => {
    const rowDiv = document.getElementById(color + '-row');
    const boxes = rowDiv.querySelectorAll('.color-box-shade');
    boxes.forEach(box => {
      box.classList.remove('selected');
      box.classList.remove('locked');

      const shadeIdx = parseInt(box.dataset.shadeIndex);

      if (lockedColors[color]) {
        if (shadeIdx === selectedShades[color]) {
          box.classList.add('selected');
          box.classList.add('locked');
        } else {
          box.classList.add('locked');
        }
      } else if (shadeIdx === selectedShades[color]) {
        box.classList.add('selected');
      }
    });
  });
}

// Enable submit button only if all colors selected and game not over
function updateSubmitButton() {
  const allSelected = COLORS.every(color => selectedShades[color] !== null);
  submitBtn.disabled = !allSelected || gameOver;
}

// Convert shade index (0-9) to RGB value (0-255)
function shadeIndexToValue(idx) {
  return Math.round((idx * 255) / (SHADES_COUNT - 1));
}

// Convert current selected shades to RGB object
function getSelectedRgb() {
  return {
    r: shadeIndexToValue(selectedShades.red),
    g: shadeIndexToValue(selectedShades.green),
    b: shadeIndexToValue(selectedShades.blue)
  };
}

// Update the target color display
function updateTargetColorDisplay() {
  targetColorDiv.style.backgroundColor = `rgb(${targetColor.r},${targetColor.g},${targetColor.b})`;
}

// Check guess against target
function checkGuess() {
  if (gameOver) return;

  attempts++;
  const guessRgb = getSelectedRgb();

  // Show guess in previous guesses
  addGuessEntry(guessRgb);

  // Check each color component
  let won = true;
  COLORS.forEach(color => {
    const c = color.charAt(0); // 'r', 'g', or 'b'
    if (guessRgb[c] === targetColor[c] && !lockedColors[color]) {
      // Lock this color in place if correct and not already locked
      lockedColors[color] = true;
    }
    if (guessRgb[c] !== targetColor[c]) {
      won = false;
    }
  });

  updateSelectorsUI();

  if (won) {
    guessResultDiv.textContent = `🎉 You Win! The correct RGB combination is (${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
    gameOver = true;
    playAgainBtn.style.display = 'inline-block';
    submitBtn.disabled = true;
    launchConfetti(targetColor);
  } else if (attempts >= MAX_ATTEMPTS) {
    guessResultDiv.textContent = `❌ Out of guesses! The correct RGB combination was (${targetColor.r}, ${targetColor.g}, ${targetColor.b}).`;
    gameOver = true;
    playAgainBtn.style.display = 'inline-block';
    submitBtn.disabled = true;
  } else {
    guessResultDiv.textContent = `Attempts left: ${MAX_ATTEMPTS - attempts}`;
    submitBtn.disabled = true; // prevent re-submitting same guess without change
  }
}

// Add guess to previous guesses display
function addGuessEntry(rgb) {
  const entryDiv = document.createElement('div');
  entryDiv.classList.add('guess-entry');

  const colorBox = document.createElement('div');
  colorBox.classList.add('guess-color-box');
  colorBox.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  entryDiv.appendChild(colorBox);

  // Show selected shade numbers (1-based) for each color
  const shadeInfo = document.createElement('div');
  shadeInfo.classList.add('shade-numbers');
  shadeInfo.textContent = `R: ${selectedShades.red + 1}, G: ${selectedShades.green + 1}, B: ${selectedShades.blue + 1}`;
  entryDiv.appendChild(shadeInfo);

  previousGuessesDiv.appendChild(entryDiv);
}

// Reset game to initial state
function resetGame() {
  attempts = 0;
  gameOver = false;
  lockedColors = { red: false, green: false, blue: false };
  selectedShades = { red: null, green: null, blue: null };
  previousGuessesDiv.innerHTML = '';
  guessResultDiv.textContent = '';
  playAgainBtn.style.display = 'none';
  submitBtn.disabled = true;

  // Pick random target color from allowed combinations
  targetColor = {
    r: shadeIndexToValue(randomInt(0, SHADES_COUNT - 1)),
    g: shadeIndexToValue(randomInt(0, SHADES_COUNT - 1)),
    b: shadeIndexToValue(randomInt(0, SHADES_COUNT - 1)),
  };

  updateTargetColorDisplay();
  updateSelectorsUI();
  updateSubmitButton();
}

// Utility random int inclusive
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Confetti using Canvas Confetti library
function launchConfetti(color) {
  // Use the CDN for canvas-confetti
  if (typeof confetti === 'undefined') {
    // Load script and then launch confetti
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => {
      doConfetti(color);
    };
    document.body.appendChild(script);
  } else {
    doConfetti(color);
  }
}

function doConfetti(color) {
  const rgb = `rgb(${color.r},${color.g},${color.b})`;
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: [rgb],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: [rgb],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Event listeners
submitBtn.addEventListener('click', checkGuess);
playAgainBtn.addEventListener('click', resetGame);

// Initialize game on page load
createColorSelectors();
resetGame();
