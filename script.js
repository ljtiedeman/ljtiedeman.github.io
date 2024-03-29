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

    // Check if any of the RGB values match
    var red_colored = false;
    var green_colored = false;
    var blue_colored = false;
    if (redGuess === targetColor.red) {
        red_colored = true;
    }

    if (greenGuess === targetColor.green) {
        green_colored = true;
    }

    if (blueGuess === targetColor.blue) {
        blue_colored = true;
    }

    // add guesses below submit
    const guessContent = document.querySelector('#prev-guesses');
    var guess_string = "<div>";
    if (red_colored) {
        guess_string+="<div style='display:inline-block;color:red'>R:&nbsp" + redGuess + "</div>&nbsp;,&nbsp;";
    } else {
        guess_string+="<div style='display:inline-block;color:black'>R:&nbsp" + redGuess + "</div>&nbsp;,&nbsp;";
    }
    if (green_colored) {
        guess_string+="<div style='display:inline-block;color:green'>G:&nbsp" + greenGuess + "</div>&nbsp;,&nbsp;";
    } else {
        guess_string+="<div style='display:inline-block;color:black'>G:&nbsp" + greenGuess + "</div>&nbsp;,&nbsp;";
    }
    if (blue_colored) {
        guess_string+="<div style='display:inline-block;color:blue'>B:&nbsp" + blueGuess + "</div>";
    } else {
        guess_string+="<div style='display:inline-block;color:black'>B:&nbsp" + blueGuess + "</div>";
    }
    guess_string+="</div><br>";
    guess_string+= guessContent.innerHTML;

    guessContent.innerHTML = guess_string;

    if (isNaN(redGuess) || isNaN(greenGuess) || isNaN(blueGuess)) {
        alert('Please enter valid numbers.');
        return;
    }

    const hint = calculateHint(redGuess, greenGuess, blueGuess);
    displayHint(hint);

    displayGuessedColor(redGuess, greenGuess, blueGuess);

    attempts--;

    const winCondition = (redGuess === targetColor.red) && (greenGuess === targetColor.green) && (blueGuess === targetColor.blue);
    if (attempts === 0 || winCondition) {
        endGame(winCondition);
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



function endGame(winCondition) {
    const resultDisplay = document.getElementById('result');
    if (winCondition) {
        resultDisplay.innerHTML = `<p>Congratulations! You guessed correctly!</p>`;
    } else {
        resultDisplay.innerHTML = `<p>Game over! The correct color was RGB(${targetColor.red}, ${targetColor.green}, ${targetColor.blue}).</p>`;
    }

    // Disable input fields and the submit button
    document.getElementById('red').disabled = true;
    document.getElementById('green').disabled = true;
    document.getElementById('blue').disabled = true;
    document.getElementById('submit-btn').disabled = true;

    // Create a "Play Again" button
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';

    // Add an event listener to the "Play Again" button to refresh the page when clicked
    playAgainButton.addEventListener('click', function() {
        location.reload(); // Reload the page
    });

    // Replace the "Submit Guess" button with the "Play Again" button
    const submitButtonContainer = document.getElementById('submit-btn-container');
    submitButtonContainer.innerHTML = ''; // Clear the container first
    submitButtonContainer.appendChild(playAgainButton);

    // shareResults()
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
                        `Final Guess Differences: ${calculateFinalDifference()}\n` + 
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
        <p>Final Guess Differences: ${calculateFinalDifference()}</p>
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

}

function handleOutsideClick(event) {
    const modal = document.querySelector('.modal-content');
    const shareResultsBtn = document.getElementById('shareResultsBtn');

    // Check if the clicked element is outside the modal and not the Share Results button
    
    if (!modal.contains(event.target) && event.target !== shareResultsBtn) {
        closeModal();
    }
}

// Function to close the modal
function closeModal() {
    const modal = document.querySelector('.modal');
    modal.remove();

    document.body.removeEventListener('click', handleOutsideClick);

}


function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.appendChild(content);

    modal.appendChild(modalContent);

    // Add event listener to close the modal when clicking outside
    document.body.addEventListener('click', handleOutsideClick);

    return modal;

}