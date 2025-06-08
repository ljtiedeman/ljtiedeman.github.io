const redContainer = document.getElementById('red-container');
const greenContainer = document.getElementById('green-container');
const blueContainer = document.getElementById('blue-container');
const submitBtn = document.getElementById('submit-btn');
const targetColorBox = document.getElementById('target-color');
const guessesContainer = document.getElementById('guesses');
const result = document.getElementById('result');
const confettiCanvas = document.getElementById('confetti');

let selected = { r: null, g: null, b: null };
let correct = { r: null, g: null, b: null };
let correctLocked = { r: false, g: false, b: false };
let guessCount = 0;
let gameOver = false;

const ctx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

const presets = [28, 56, 85, 113, 142, 170, 198, 227, 240, 255];

function randomIndex() {
  return Math.floor(Math.random() * presets.length);
}

function makeBoxes(container, channel) {
  for (let i = 0; i < 10; i++) {
    const box = document.createElement('div');
    box.classList.add('color-box');
    if (channel === 'r') box.style.backgroundColor = `rgb(${presets[i]},0,0)`;
    if (channel === 'g') box.style.backgroundColor = `rgb(0,${presets[i]},0)`;
    if (channel === 'b') box.style.backgroundColor = `rgb(0,0,${presets[i]})`;

    const label = document.createElement('span');
    label.textContent = i + 1;
    box.appendChild(label);

    box.addEventListener('click', () => {
      if (gameOver || correctLocked[channel]) return;

      [...container.children].forEach(child => child.classList.remove('selected'));
      box.classList.add('selected');
      selected[channel] = i;

      const allSelected = ['r', 'g', 'b'].every(
        (ch) => correctLocked[ch] || selected[ch] !== null
      );
      submitBtn.disabled = !allSelected;
    });

    container.appendChild(box);
  }
}

function generateTargetColor() {
  correct.r = randomIndex();
  correct.g = randomIndex();
  correct.b = randomIndex();
  const rgb = `rgb(${presets[correct.r]},${presets[correct.g]},${presets[correct.b]})`;
  targetColorBox.style.backgroundColor = rgb;
}

function showGuess(r, g, b) {
  const row = document.createElement('div');
  row.classList.add('guess-box');
  const color = document.createElement('div');
  color.classList.add('guess-color');
  color.style.backgroundColor = `rgb(${presets[r]},${presets[g]},${presets[b]})`;
  row.appendChild(color);
  row.innerHTML += `R: <strong>${r + 1}</strong> | G: <strong>${g + 1}</strong> | B: <strong>${b + 1}</strong>`;
  guessesContainer.appendChild(row);
}

function fireConfetti(color) {
  const particles = 150;
  for (let i = 0; i < particles; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 8 + 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  }
}

submitBtn.addEventListener('click', () => {
  if (gameOver) return;
  const { r, g, b } = selected;
  showGuess(r, g, b);
  guessCount++;

  let correctGuess = true;
  ['r', 'g', 'b'].forEach(ch => {
    if (selected[ch] === correct[ch]) {
      correctLocked[ch] = true;
      const container = document.getElementById(`${ch === 'r' ? 'red' : ch === 'g' ? 'green' : 'blue'}-container`);
      const box = container.children[selected[ch]];
      box.classList.add('correct');
    } else {
      correctGuess = false;
    }
  });

  selected = { r: null, g: null, b: null };
  submitBtn.disabled = true;

  if (correctGuess) {
    result.textContent = 'You got it! ✨';
    fireConfetti(`rgb(${presets[correct.r]},${presets[correct.g]},${presets[correct.b]})`);
    gameOver = true;
    const playAgain = document.createElement('button');
    playAgain.textContent = 'Play Again';
    playAgain.onclick = () => location.reload();
    result.appendChild(playAgain);
  } else if (guessCount >= 5) {
    result.innerHTML = `❌ Out of guesses! The correct RGB combination was (R: <strong>${correct.r + 1}</strong>, G: <strong>${correct.g + 1}</strong>, B: <strong>${correct.b + 1}</strong>)`;
    gameOver = true;
    const playAgain = document.createElement('button');
    playAgain.textContent = 'Play Again';
    playAgain.onclick = () => location.reload();
    result.appendChild(playAgain);
  }
});

makeBoxes(redContainer, 'r');
makeBoxes(greenContainer, 'g');
makeBoxes(blueContainer, 'b');
generateTargetColor();
