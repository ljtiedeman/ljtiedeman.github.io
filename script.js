const redContainer = document.getElementById("red-container");
const greenContainer = document.getElementById("green-container");
const blueContainer = document.getElementById("blue-container");
const targetBox = document.getElementById("target-color");
const guessesList = document.getElementById("guesses");
const resultDiv = document.getElementById("result");
const playAgainDiv = document.getElementById("play-again");
const submitBtn = document.getElementById("submit-btn");

let redGuess = null;
let greenGuess = null;
let blueGuess = null;
let correctValues = { red: null, green: null, blue: null };
let locked = { red: false, green: false, blue: false };
let attempts = 0;
let maxAttempts = 5;

function generateColor(value, channel) {
  const intensity = Math.round((value - 1) * 255 / 9);
  return channel === "red"
    ? `rgb(${intensity},0,0)`
    : channel === "green"
    ? `rgb(0,${intensity},0)`
    : `rgb(0,0,${intensity})`;
}

function generateTargetColor() {
  correctValues.red = Math.ceil(Math.random() * 10);
  correctValues.green = Math.ceil(Math.random() * 10);
  correctValues.blue = Math.ceil(Math.random() * 10);
  const rgb = getRGB(correctValues.red, correctValues.green, correctValues.blue);
  targetBox.style.backgroundColor = rgb;
}

function getRGB(r, g, b) {
  const rVal = Math.round((r - 1) * 255 / 9);
  const gVal = Math.round((g - 1) * 255 / 9);
  const bVal = Math.round((b - 1) * 255 / 9);
  return `rgb(${rVal}, ${gVal}, ${bVal})`;
}

function createColorBoxes(container, color) {
  container.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const box = document.createElement("div");
    box.classList.add("color-box");
    box.style.backgroundColor = generateColor(i, color);
    box.dataset.value = i;
    box.innerHTML = `<div class="box-label">${i}</div>`;
    box.addEventListener("click", () => selectBox(color, i));
    container.appendChild(box);
  }
}

function selectBox(color, value) {
  if (locked[color]) return;

  if (color === "red") redGuess = value;
  if (color === "green") greenGuess = value;
  if (color === "blue") blueGuess = value;

  const container = color === "red" ? redContainer : color === "green" ? greenContainer : blueContainer;
  [...container.children].forEach(box => {
    box.classList.remove("selected");
    if (parseInt(box.dataset.value) === value) {
      box.classList.add("selected");
    }
  });

  checkReadyToSubmit();
}

function checkReadyToSubmit() {
  if ((redGuess || locked.red) && (greenGuess || locked.green) && (blueGuess || locked.blue)) {
    submitBtn.disabled = false;
  }
}

function lockCorrect(color, value) {
  const container = color === "red" ? redContainer : color === "green" ? greenContainer : blueContainer;
  locked[color] = true;
  [...container.children].forEach(box => {
    if (parseInt(box.dataset.value) === value) {
      box.classList.add("correct");
    }
  });
}

function addGuess(r, g, b) {
  const rgb = getRGB(r, g, b);
  const box = document.createElement("div");
  box.className = "guess-box";
  box.innerHTML = `
    <div class="guess-color" style="background-color: ${rgb}"></div>
    <div>Red: ${r}, Green: ${g}, Blue: ${b}</div>
  `;
  guessesList.appendChild(box);
}

function showConfetti(color) {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  for (let i = 0; i < 300; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      speed: Math.random() * 3 + 2,
      size: Math.random() * 6 + 2,
      angle: Math.random() * Math.PI * 2,
      color,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(p.angle);
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  function animate() {
    draw();
    update();
    requestAnimationFrame(animate);
  }

  animate();
}

// Create the Share Result button
const shareBtn = document.createElement("button");
shareBtn.className = "play-again-btn";
shareBtn.textContent = "Share Result";
shareBtn.style.marginLeft = "10px";

shareBtn.addEventListener("click", async () => {
  const shareCanvas = document.createElement("canvas");
  const ctx = shareCanvas.getContext("2d");
  const padding = 20;
  const boxSize = 30;
  const guessHeight = 50;
  const guesses = [...guessesList.children];
  const width = 360;
  const height = padding * 2 + guesses.length * guessHeight + 160;

  shareCanvas.width = width;
  shareCanvas.height = height;

  // Background white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Branding with emoji and font to match game style
  ctx.fillStyle = "#000";
  ctx.font = "bold 20px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.fillText("🎨 HueGuessr", padding, 30);

  // Target color swatch and label
  ctx.fillStyle = targetBox.style.backgroundColor;
  ctx.fillRect(padding, 50, boxSize * 2, boxSize);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(padding, 50, boxSize * 2, boxSize);
  ctx.fillStyle = "#000";
  ctx.font = "14px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  const targetRGB = `RGB (${correctValues.red}, ${correctValues.green}, ${correctValues.blue})`;
  ctx.fillText(`Target: ${targetRGB}`, padding + boxSize * 2 + 10, 70);

  // Draw guesses with color swatches and RGB values
  guesses.forEach((guess, index) => {
    const colorEl = guess.querySelector(".guess-color");
    const labelEl = guess.querySelector("div:nth-child(2)");
    const y = 100 + index * guessHeight;

    ctx.fillStyle = colorEl.style.backgroundColor;
    ctx.fillRect(padding, y, boxSize, boxSize);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(padding, y, boxSize, boxSize);

    ctx.fillStyle = "#000";
    ctx.font = "14px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText(labelEl.textContent.trim(), padding + boxSize + 10, y + 20);
  });

  // Result caption in bold
  // Format and draw result caption more cleanly
  ctx.font = "bold 16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.fillStyle = "#000";

  const isOutOfGuesses = resultDiv.textContent.includes("Out of guesses");

  if (isOutOfGuesses) {
    ctx.fillText("❌ Out of guesses!", padding, height - 90);
    ctx.font = "14px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText("The correct RGB combination was:", padding, height - 70);
    ctx.fillText(
      `Red: ${correctValues.red}, Green: ${correctValues.green}, Blue: ${correctValues.blue}`,
      padding,
      height - 50
    );
  } else {
    ctx.fillText(resultDiv.textContent.trim(), padding, height - 60);
  }


  // Play link in blue
  ctx.fillStyle = "#007bff";
  ctx.font = "14px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  ctx.fillText("Play on hueguessr.com", padding, height - 30);

  // Copy canvas image to clipboard as PNG blob
  shareCanvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert("📋 Result copied to clipboard! Share your score with friends!");
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert("❌ Clipboard copy failed. Try manually saving the image.");
    }
  });
});

function attachShareButton() {
  playAgainDiv.appendChild(shareBtn);
}

function handleSubmit() {
  if (submitBtn.disabled) return;

  const r = locked.red ? correctValues.red : redGuess;
  const g = locked.green ? correctValues.green : greenGuess;
  const b = locked.blue ? correctValues.blue : blueGuess;

  addGuess(r, g, b);

  if (r === correctValues.red) lockCorrect("red", r);
  if (g === correctValues.green) lockCorrect("green", g);
  if (b === correctValues.blue) lockCorrect("blue", b);

  if (r === correctValues.red && g === correctValues.green && b === correctValues.blue) {
    resultDiv.innerHTML = `<h3>🎉 You matched the color! 🎉</h3>`;
    submitBtn.remove();
    showConfetti(getRGB(r, g, b));
    const playBtn = document.createElement("button");
    playBtn.className = "play-again-btn";
    playBtn.textContent = "Play Again";
    playBtn.onclick = () => location.reload();
    playAgainDiv.appendChild(playBtn);
    attachShareButton();
    return;
  }

  attempts++;
  if (attempts >= maxAttempts) {
    resultDiv.innerHTML = `<h3>❌ Out of guesses! The correct RGB combination was:<br>
    Red: ${correctValues.red}, Green: ${correctValues.green}, Blue: ${correctValues.blue}</h3>`;
    const playBtn = document.createElement("button");
    playBtn.className = "play-again-btn";
    playBtn.textContent = "Play Again";
    playBtn.onclick = () => location.reload();
    resultDiv.appendChild(playBtn);
    submitBtn.remove();
    attachShareButton();
    return;
  }

  submitBtn.disabled = true;
  redGuess = greenGuess = blueGuess = null;
}

submitBtn.addEventListener("click", handleSubmit);

generateTargetColor();
createColorBoxes(redContainer, "red");
createColorBoxes(greenContainer, "green");
createColorBoxes(blueContainer, "blue");

