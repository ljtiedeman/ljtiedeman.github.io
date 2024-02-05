document.addEventListener('DOMContentLoaded', startGame);

let targetColor;
let attempts = 5;

let guessedColorsForSharing = [];

function startGame() {
    generateRandomColor();
    displayColor();
    displayAttempts();
    guessedColorsForSharing = []; // Reset the array at the start of each game
}

function generateRandomColor() {
    targetColor = {
        red: getRandomValue(),
        green: getRandomValue(),
        blue: getRandomValue()
    };
}

function getRandomValue() {
    return Math.floor(Math.random() * 256);
}

function displayColor() {
    const colorDisplay = document.getElementById('color-display');
    colorDisplay.style.backgroundColor = `rgb(${targetColor.red}, ${targetColor.green}, ${targetColor.blue})`;
}

function displayAttempts() {
    const attemptsContainer = document.getElementById('attempts-container');
    attemptsContainer.innerHTML = "";

    for (let i = 0; i < attempts; i++) {
        const attemptBox = document.createElement('div');
        attemptBox.className = 'attempt-box';
        attemptsContainer.appendChild(attemptBox);
    }
}

function checkGuess() {
    const redGuess = parseInt(document.getElementById('red').value);
    const greenGuess = parseInt(document.getElementById('green').value);
    const blueGuess = parseInt(document.getElementById('blue').value);

    if (isNaN(redGuess) || isNaN(greenGuess) || isNaN(blueGuess)) {
        alert('Please enter valid numbers.');
        return;
    }

    const hint = calculateHint(redGuess, greenGuess, blueGuess);
    displayHint(hint);

    displayGuessedColor(redGuess, greenGuess, blueGuess);

    attempts--;

    if (attempts === 0) {
        endGame();
    }
}

function calculateHint(redGuess, greenGuess, blueGuess) {
    const hintValue = Math.abs(targetColor.red - redGuess) +
                      Math.abs(targetColor.green - greenGuess) +
                      Math.abs(targetColor.blue - blueGuess);

    return hintValue;
}

function displayHint(hint) {
    const hintDisplay = document.getElementById('hint');
    hintDisplay.textContent = `Hint: ${hint}`;
}

// ...

function displayGuessedColor(redGuess, greenGuess, blueGuess) {
    const attemptsContainer = document.getElementById('attempts-container');
    const attemptBoxes = attemptsContainer.getElementsByClassName('attempt-box');

    const guessedColorBox = document.createElement('div');
    guessedColorBox.className = 'guessed-color-box';
    guessedColorBox.style.backgroundColor = `rgb(${redGuess}, ${greenGuess}, ${blueGuess})`;

    attemptBoxes[5 - attempts].appendChild(guessedColorBox);  // Adjusted index for proper placement

    guessedColorsForSharing.push({ red: redGuess, green: greenGuess, blue: blueGuess });
}


// ...



function endGame() {
    const resultDisplay = document.getElementById('result');
    resultDisplay.innerHTML = `<p>Game over! The correct color was RGB(${targetColor.red}, ${targetColor.green}, ${targetColor.blue}).</p>`;
    
    // Additional logic or UI updates after the game ends can be added here.
}

function getRGBValuesFromColorString(colorString) {
    // Extract RGB values from the "rgb(r, g, b)" format
    const rgbValues = colorString.match(/\d+/g);
    return {
        red: parseInt(rgbValues[0]),
        green: parseInt(rgbValues[1]),
        blue: parseInt(rgbValues[2])
    };
}

function calculateFinalDifference() {
    const lastGuessedColor = guessedColorsForSharing[guessedColorsForSharing.length - 1];

    if (!lastGuessedColor) {
        return 'No guesses yet';
    }

    const redDifference = Math.abs(targetColor.red - lastGuessedColor.red);
    const greenDifference = Math.abs(targetColor.green - lastGuessedColor.green);
    const blueDifference = Math.abs(targetColor.blue - lastGuessedColor.blue);

    return `Red: ${redDifference}, Green: ${greenDifference}, Blue: ${blueDifference}`;
}

function displayGuessedColorsForSharing(container) {
    const heading = document.createElement('p');
    heading.textContent = 'Guessed Colors (Share your results):';
    container.appendChild(heading);

    for (const guessedColor of guessedColorsForSharing) {
        const guessedColorBox = document.createElement('div');
        guessedColorBox.className = 'guessed-color-box';
        guessedColorBox.style.backgroundColor = `rgb(${guessedColor.red}, ${guessedColor.green}, ${guessedColor.blue})`;
        container.appendChild(guessedColorBox);
    }
}


function resetGame() {
    attempts = 5;
    generateRandomColor();
    displayColor();
    displayAttempts();
    const hintDisplay = document.getElementById('hint');
    hintDisplay.textContent = '';
    
    const resultDisplay = document.getElementById('result');
    resultDisplay.innerHTML = '';

    const guessesContainer = document.getElementById('guesses-container');
    guessesContainer.innerHTML = '';
}
// ...

function getGuessedColorsText() {
    return guessedColorsForSharing.map(color => `RGB(${color.red}, ${color.green}, ${color.blue})`).join(', ');
}

function copyResultsToClipboard() {
    const resultsText = `Target Color: RGB(${targetColor.red}, ${targetColor.green}, ${targetColor.blue})\n` +
                        `Guessed Colors: ${getGuessedColorsText()}\n` +
                        `Final Guesses Difference: ${calculateFinalDifference()}\n` + 
                        `Play HueGuesser at https://ljtiedeman.github.io/`

    navigator.clipboard.writeText(resultsText)
        .catch((error) => {
            console.error('Unable to copy to clipboard', error);
        });
}

function shareResults() {
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.innerHTML = `
        <p>Target Color: RGB(${targetColor.red}, ${targetColor.green}, ${targetColor.blue})</p>
        <div id="target-color-display" style="width: 30px; height: 30px; background-color: rgb(${targetColor.red}, ${targetColor.green}, ${targetColor.blue});"></div>
        <div id="guessed-colors-container"></div>
        <p>Final Guesses Difference: ${calculateFinalDifference()}</p>
        <button id="copyToClipboardBtn">Copy to Clipboard</button>
    `;

    // Display guessed colors in the modal
    const guessedColorsContainer = modalContent.querySelector('#guessed-colors-container');
    displayGuessedColorsForSharing(guessedColorsContainer);

    // Create and append the modal to the body
    const modal = createModal(modalContent);
    document.body.appendChild(modal);

    // Set the display property to 'block' to make the modal visible
    modal.style.display = 'block';

    // Add event listener to the "Copy to Clipboard" button
    const copyToClipboardBtn = modalContent.querySelector('#copyToClipboardBtn');
    copyToClipboardBtn.addEventListener('click', copyResultsToClipboard);
}

function displayGuessedColorsForSharing(container) {
    const heading = document.createElement('p');
    heading.textContent = 'Guessed Colors:';
    container.appendChild(heading);

    for (const guessedColor of guessedColorsForSharing) {
        const guessedColorBox = document.createElement('div');
        guessedColorBox.className = 'guessed-color-box-sharing';
        guessedColorBox.style.backgroundColor = `rgb(${guessedColor.red}, ${guessedColor.green}, ${guessedColor.blue})`;
        container.appendChild(guessedColorBox);
    }
    // Add event listener to close the modal when clicking outside
    console.log("ADDING THE BODY LISTENER");
    document.body.addEventListener('click', handleOutsideClick);
    console.log("ADDED THE BODY LISTENER");

}

function handleOutsideClick(event) {
    console.log("FUNCTION GETS CALLED WHEN WE CLICK BODY");
    const modal = document.querySelector('.modal-content');
    const shareResultsBtn = document.getElementById('shareResultsBtn');

    // Check if the clicked element is outside the modal and not the Share Results button
    
    if (!modal.contains(event.target) && event.target !== shareResultsBtn) {
        console.log("CLOSING MODAL");
        closeModal();
        console.log("CLOSED MODAL");
    }
}

// Function to close the modal
function closeModal() {
    const modal = document.querySelector('.modal-content');
    modal.style.display = 'none';

    // Remove the outside click event listener
    document.body.removeEventListener('click', handleOutsideClick);

    // Add any other logic you need to reset or close the modal
}


function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.appendChild(content);

    modal.appendChild(modalContent);

    return modal;

}