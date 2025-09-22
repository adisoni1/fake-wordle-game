document.addEventListener('DOMContentLoaded', () => {
    const WORD_TO_GUESS = "DURITO";
    const WORD_LENGTH = 6;
    const INITIAL_GUESSES = 6;

    const board = document.getElementById('game-board');
    const clearButton = document.getElementById('clear-button');

    let currentRowIndex = 0;
    let currentColIndex = 0;
    let guesses = []; // To store submitted guesses for persistence

    // Function to create the initial grid
    function createGrid() {
        board.innerHTML = ''; // Clear previous grid if any
        for (let i = 0; i < INITIAL_GUESSES; i++) {
            for (let j = 0; j < WORD_LENGTH; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                // Add an ID for easy access, e.g., tile-0-1 for row 0, col 1
                tile.id = `tile-${i}-${j}`;
                board.appendChild(tile);
            }
        }
    }

    // Function to add a new row to the grid
    function addNewRow() {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile-${currentRowIndex}-${j}`;
            board.appendChild(tile);
        }
    }

    // Function to handle guess submission
    function submitGuess() {
        let guess = '';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            guess += tile.textContent;
        }

        guess = guess.toUpperCase();
        const guessResult = [];
        const correctLetters = WORD_TO_GUESS.split('');
        const guessLetters = guess.split('');

        // Color the tiles based on the guess
        guessLetters.forEach((letter, index) => {
            const tile = document.getElementById(`tile-${currentRowIndex}-${index}`);
            let state = 'incorrect';
            if (letter === correctLetters[index]) {
                state = 'correct';
            } else if (correctLetters.includes(letter)) {
                state = 'misplaced';
            }
            tile.classList.add(state);
            guessResult.push({ letter, state });
        });

        guesses.push(guessResult);
        saveGame();

        if (guess === WORD_TO_GUESS) {
            setTimeout(() => alert('You win!'), 100);
            document.removeEventListener('keydown', handleKeyDown); // Disable further input
            return;
        }

        // Move to the next row
        currentRowIndex++;
        currentColIndex = 0;

        // Add a new row if we've reached the end of the current grid
        const lastTileId = `tile-${currentRowIndex}-0`;
        if (!document.getElementById(lastTileId)) {
            addNewRow();
        }
    }

    // Function to handle keyboard input
    function handleKeyDown(event) {
        const key = event.key;

        if (key === 'Enter') {
            if (currentColIndex === WORD_LENGTH) {
                submitGuess();
            }
        } else if (key === 'Backspace') {
            if (currentColIndex > 0) {
                currentColIndex--;
                const tile = document.getElementById(`tile-${currentRowIndex}-${currentColIndex}`);
                tile.textContent = '';
            }
        } else if (/^[a-zA-Z]$/.test(key)) {
            if (currentColIndex < WORD_LENGTH) {
                const tile = document.getElementById(`tile-${currentRowIndex}-${currentColIndex}`);
                tile.textContent = key.toUpperCase();
                currentColIndex++;
            }
        }
    }

    // --- Persistence ---
    function saveGame() {
        localStorage.setItem('wordle-guesses', JSON.stringify(guesses));
    }

    function loadGame() {
        const savedGuesses = JSON.parse(localStorage.getItem('wordle-guesses'));
        if (savedGuesses) {
            guesses = savedGuesses;
            guesses.forEach((guess, rowIndex) => {
                // Ensure enough rows exist
                const lastTileId = `tile-${rowIndex}-0`;
                if (!document.getElementById(lastTileId)) {
                   addNewRow(); // This uses currentRowIndex, so we need to set it first
                }

                guess.forEach((tileData, colIndex) => {
                    const tile = document.getElementById(`tile-${rowIndex}-${colIndex}`);
                    tile.textContent = tileData.letter;
                    tile.classList.add(tileData.state);
                });
            });
            currentRowIndex = guesses.length;
            // Check if more rows are needed if the game was saved mid-guess
             while(currentRowIndex >= document.querySelectorAll('#game-board .tile').length / WORD_LENGTH) {
                addNewRow();
            }
        }
    }

    // --- Event Listeners ---
    clearButton.addEventListener('click', () => {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            if (tile) {
                tile.textContent = '';
            }
        }
        currentColIndex = 0;
    });

    // Initialize the game
    createGrid();
    loadGame(); // Load saved state
    document.addEventListener('keydown', handleKeyDown);
});
