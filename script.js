const MAX_GUESSES = 5;

const redSelector = document.getElementById('red-selector');
const greenSelector = document.getElementById('green-selector');
const blueSelector = document.getElementById('blue-selector');
const targetColorBox = document.getElementById('target-color');
const submitBtn = document.getElementById('submit-btn');
const prevGuessesContainer = document.getElementById('prev-guesses');
const resultDiv = document.getElementById('result');

let target = { r: 0, g: 0, b: 0 };
let selected = { r: null, g: null, b: null };
let correctLocked = { r: false, g: false, b: false };
let guesses = 0;
let gameOver = false;

// Generate 10 shades for each color channel, from light (1) to dark (10)
function generateShades(channel) {
  // channel: 'r', 'g', 'b'
  const shades = [];
  for (let i = 1; i <= 10; i++) {
    // Calculate value from light to dark:
    // Scale i=1 to value = 25.5, i=10 to 255
    const val = Math.round((i / 10) * 255);
    let color = { r: 0, g: 0, b: 0 };
    color[channel === 'r' ? 'r' : 0] = 0;
    color[channel === 'g' ? 'g' : 0] = 0;
    color[channel === 'b' ? 'b' : 0] = 0;
    if (channel === 'r') color.r = val;
    else if (channel === 'g') color.g = val;
    else if (channel === 'b') color.b = val;
    shades.push({ index: i, val, color });
  }
  return shades;
}

function createColorBoxes(container, channel) {
  container.innerHTML = '';
  const shades = [];
  for (let i = 1; i <= 10; i++) {
    const val = Math.round((i / 10) * 255);
    let r = 0, g = 0, b = 0;
    if (channel === 'r') r = val;
    else if (channel === 'g') g = val;
    else if (channel === 'b') b = val;
    const box = document.createElement('div');
    box.classList.add('color-box');
    box.style.backgroundColor = `rgb(${r},${g},${b})`;
    box.textContent = i;
    box.title = `Shade ${i}`;
    box.dataset.value = i;
    box.addEventListener('click', () => {
      if (gameOver) return;

      if (correctLocked[channel]) return; // locked, no change

      // Clear previous selected
      [...container.children].forEach(child => child.classList.remove('selected'));
      box.classList.add('selected');
      selected[channel] = i;
    });
    container.appendChild(box);
    shades.push(box);
  }
  return shades;
}

function rgbFromSelection(selection) {
  // Convert 1-10 selection to RGB value 0-255 scale
  return Math.round((selection / 10) * 255);
}

function displayTargetColor() {
  const r = rgbFromSelection(target.r);
  const g = rgbFromSelection(target.g);
  const b = rgbFromSelection(target.b);
  targetColorBox.style.backgroundColor = `rgb(${r},${g},${b})`;
}

function disableSubmit() {
  submitBtn.disabled = true;
}

function enableSubmit() {
  submitBtn.disabled = false;
}

function resetGame() {
  selected = { r: null, g: null, b: null };
  correctLocked = { r: false, g: false, b: false };
  guesses = 0;
  gameOver = false;
  prevGuessesContainer.innerHTML = '';
  resultDiv.textContent = '';
  submitBtn.textContent = 'Submit Guess';
  submitBtn.disabled = true;

  createColorBoxes(redSelector, 'r');
  createColorBoxes(greenSelector, 'g');
  createColorBoxes(blueSelector, 'b');

  // Random target from 1-10 for each channel
  target = {
    r: Math.floor(Math.random() * 10) + 1,
    g: Math.floor(Math.random() * 10) + 1,
    b: Math.floor(Math.random() * 10) + 1,
  };

  displayTargetColor();
}

function updateSelectedBoxes() {
  ['r', 'g', 'b'].forEach(channel => {
    const container = document.getElementById(channel + '-selector');
    [...container.children].forEach(box => {
      const boxVal = parseInt(box.dataset.value, 10);

      box.classList.remove('correct');
      box.classList.remove('selected');

      if (correctLocked[channel] && boxVal === target[channel]) {
        box.classList.add('correct');
        box.classList.remove('selected');
      } else if (selected[channel] === boxVal) {
        box.classList.add('selected');
      }
    });
  });
}

function checkGuess() {
  if (gameOver) return;

  // Ensure all selected
  if (selected.r === null || selected.g === null || selected.b === null) {
    alert('Please select a shade for Red, Green, and Blue before submitting.');
    return;
  }

  guesses++;

  // Lock correct selections
  ['r', 'g', 'b'].forEach(channel => {
    if (selected[channel] === target[channel]) {
      correctLocked[channel] = true;
    }
  });

  updateSelectedBoxes();

  // Show previous guess
  addGuessToHistory(selected);

  // Check win condition
  if (
    selected.r === target.r &&
    selected.g === target.g &&
    selected.b === target.b
  ) {
    gameOver = true;
    showResult(true);
    return;
  }

  // Check if out of guesses
  if (guesses >= MAX_GUESSES) {
    gameOver = true;
    showResult(false);
    return;
  }

  // Reset current selection only for unlocked colors
  ['r', 'g', 'b'].forEach(channel => {
    if (!correctLocked[channel]) selected[channel] = null;
  });

  updateSelectedBoxes();

  submitBtn.disabled = true; // Disable until user reselects all unlocked
}

function addGuessToHistory(guess) {
  const guessItem = document.createElement('div');
  guessItem.classList.add('guess-item');

  // For each channel, show colored box + number
  ['r', 'g', 'b'].forEach(channel => {
    const val = guess[channel];
    const rgbVal = Math.round((val / 10) * 255);
    const box = document.createElement('div');
    box.classList.add('guess-box');
    box.style.backgroundColor =
      channel === 'r'
        ? `rgb(${rgbVal},0,0)`
        : channel === 'g'
        ? `rgb(0,${rgbVal},0)`
        : `rgb(0,0,${rgbVal})`;
    box.textContent = val;
    guessItem.appendChild(box);
  });

  prevGuessesContainer.appendChild(guessItem);
}

function showResult(won) {
  if (won) {
    resultDiv.textContent = `🎉 You Win! The correct combination was (${target.r}, ${target.g}, ${target.b}).`;
    launchConfetti();
    submitBtn.textContent = 'Play Again';
  } else {
    resultDiv.textContent = `❌ Out of guesses! The correct combination was (${target.r}, ${target.g}, ${target.b}).`;
    submitBtn.textContent = 'Play Again';
  }
  submitBtn.disabled = false;
  submitBtn.onclick = () => resetGame();
}

function launchConfetti() {
  const r = Math.round((target.r / 10) * 255);
  const g = Math.round((target.g / 10) * 255);
  const b = Math.round((target.b / 10) * 255);
  const color = `rgb(${r},${g},${b})`;

  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // since particles fall down, skew start toward top
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: Math.random(), y: Math.random() * 0.6 },
        colors: [color],
      })
    );
  }, 250);
}

// Enable submit button only if all unlocked colors have a selection
function updateSubmitButton() {
  if (gameOver) {
    submitBtn.disabled = false;
    return;
  }
  const allSelected = ['r', 'g', 'b'].every(
    (channel) => correctLocked[channel] || selected[channel] !== null
  );
  submitBtn.disabled = !allSelected;
}

// Watch for selection changes and update submit button state
function watchSelections() {
  ['r', 'g', 'b'].forEach(channel => {
    const container = document.getElementById(channel + '-selector');
    container.addEventListener('click', () => {
      updateSubmitButton();
    });
  });
}

window.onload = function () {
  resetGame();
  watchSelections();
};
